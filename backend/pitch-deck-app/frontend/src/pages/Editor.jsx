import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import SlideSidebar from '../components/Editor/SlideSidebar';
import SlideEditor from '../components/Editor/SlideEditor';
import SlidePreview from '../components/Editor/SlidePreview';
import SlideRegenerator from '../components/Editor/SlideRegenerator';
import AIChatbot from '../components/Editor/AIChatbot';
import ExportOptions from '../components/Editor/ExportOptions';
import { deckAPI } from '../utils/api'; 
import { 
  FiPlus, 
  FiTrash2, 
  FiEye, 
  FiEdit, 
  FiChevronLeft, 
  FiChevronRight, 
  FiLoader, 
  FiMessageSquare, 
  FiDownload, 
  FiX 
} from 'react-icons/fi';

/**
 * Editor Component - Main slide deck editor interface
 * Provides functionality for editing slides, navigation, and exporting
 */
const Editor = () => {
  const { deckId } = useParams();
  
  // State management
  const [deck, setDeck] = useState(null);
  const [slides, setSlides] = useState([]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isPreview, setIsPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  /**
   * Load deck data from API on component mount
   */
  useEffect(() => {
    const loadDeck = async () => {
      if (!deckId) {
        setError('No deck ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await deckAPI.getById(deckId);
        const deckData = response.data?.data;
        
        setDeck(deckData);
        const parsedSlides = Array.isArray(deckData.slides) ? deckData.slides : [];
        setSlides(parsedSlides);
        setError(null);
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to load deck');
      } finally {
        setLoading(false);
      }
    };

    loadDeck();
  }, [deckId]);

  /**
   * Handle keyboard shortcuts for navigation and actions
   */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        goToPreviousSlide();
      } else if (e.key === 'ArrowRight') {
        goToNextSlide();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        handleRegenerateSlide(slides[activeSlideIndex]);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slides, activeSlideIndex]);

  /**
   * Navigation handlers
   */
  const handleSlideChange = (index) => {
    setActiveSlideIndex(index);
  };

  const goToPreviousSlide = () => {
    setActiveSlideIndex(prev => Math.max(0, prev - 1));
  };

  const goToNextSlide = () => {
    setActiveSlideIndex(prev => Math.min(slides.length - 1, prev + 1));
  };

  /**
   * Slide management handlers
   */
  const handleSlideUpdate = async (updatedSlide) => {
    try {
      setSaving(true);
      await deckAPI.updateSlide(deckId, updatedSlide.id, updatedSlide);
      
      const updatedSlides = [...slides];
      updatedSlides[activeSlideIndex] = updatedSlide;
      setSlides(updatedSlides);
      
    } catch (error) {
      setError('Failed to save slide changes');
    } finally {
      setSaving(false);
    }
  };

  const handleSlideReorder = async (reorderedSlides) => {
    try {
      setSaving(true);
      
      const slidesWithNewOrder = reorderedSlides.map((slide, index) => ({
        ...slide,
        order: index + 1
      }));
      
      setSlides(slidesWithNewOrder);
      const slideIds = slidesWithNewOrder.map(slide => slide.id);
      await deckAPI.reorderSlides(deckId, slideIds);
      
    } catch (error) {
      setError('Failed to reorder slides');
      
      // Revert on error
      try {
        const response = await deckAPI.getById(deckId);
        const deckData = response.data;
        let parsedSlides = typeof deckData.slides === 'string' 
          ? JSON.parse(deckData.slides) 
          : deckData.slides;
        setSlides(parsedSlides);
      } catch (revertError) {
        // Silent error for revert attempt
      }
    } finally {
      setSaving(false);
    }
  };

  const handleAddSlide = async () => {
    try {
      setSaving(true);
      
      const newSlideId = `slide-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newSlide = {
        id: newSlideId,
        title: 'New Slide',
        content: 'Add your content here...',
        type: 'content',
        order: slides.length + 1,
        imageSuggestions: []
      };
      
      const updatedSlides = [...slides, newSlide];
      setSlides(updatedSlides);
      setActiveSlideIndex(updatedSlides.length - 1);
      
      await deckAPI.addSlide(deckId, newSlide);
      
    } catch (error) {
      setError('Failed to add slide');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSlide = async () => {
    if (slides.length === 1) {
      alert('You must have at least one slide.');
      return;
    }

    try {
      setSaving(true);
      const slideToDelete = slides[activeSlideIndex];
      
      await deckAPI.deleteSlide(deckId, slideToDelete.id);

      const updatedSlides = [...slides];
      updatedSlides.splice(activeSlideIndex, 1);

      setSlides(updatedSlides);
      setActiveSlideIndex(Math.max(0, activeSlideIndex - 1));
      
    } catch (error) {
      setError('Failed to delete slide');
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerateSlide = async (regeneratedSlide) => {
    try {
      setSaving(true);
      await handleSlideUpdate(regeneratedSlide);
    } catch (error) {
      setError('Failed to apply regenerated content');
    } finally {
      setSaving(false);
    }
  };

  /**
   * UI state handlers
   */
  const togglePreviewMode = () => setIsPreview(!isPreview);
  const toggleChatbot = () => setIsChatOpen(!isChatOpen);
  const toggleExportModal = () => setShowExportModal(!showExportModal);

  /**
   * Render loading state
   */
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <FiLoader className="h-8 w-8 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-gray-600">Loading your deck...</p>
        </div>
      </div>
    );
  }

  /**
   * Render error state
   */
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-md p-4 max-w-md">
            <h3 className="text-sm font-medium text-red-800 mb-2">Error</h3>
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Render empty state
   */
  if (!slides.length) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">No slides found</p>
        </div>
      </div>
    );
  }

  /**
   * Render main editor interface
   */
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Deck Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {deck?.title || 'Slide Deck'}
          </h2>
          <p className="text-sm text-gray-500">
            {deck?.description || `Editing: Deck ${deckId}`}
          </p>
        </div>
        
        {/* Slide Navigation */}
        <SlideSidebar
          slides={slides}
          activeIndex={activeSlideIndex}
          onSelectSlide={handleSlideChange}
          onReorderSlides={handleSlideReorder}
        />
        
        {/* Add Slide Button */}
        <div className="p-4 border-t border-gray-200 mt-auto">
          <button
            onClick={handleAddSlide}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <FiLoader className="h-5 w-5 animate-spin" />
            ) : (
              <FiPlus className="h-5 w-5" />
            )}
            Add Slide
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            {/* Mode */}
            <button
              onClick={togglePreviewMode}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
              style={{
                backgroundColor: isPreview ? '#EFF6FF' : 'transparent',
                color: isPreview ? '#2563EB' : '#4B5563'
              }}
            >
              {isPreview ? (
                <>
                  <FiEdit className="h-5 w-5" />
                  <span>Edit Mode</span>
                </>
              ) : (
                <>
                  <FiEye className="h-5 w-5" />
                  <span>Preview Mode</span>
                </>
              )}
            </button>
            
            {/* AI Assistant button */}
            <button
              onClick={toggleChatbot}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isChatOpen 
                  ? 'bg-indigo-100 text-indigo-700 border border-indigo-300' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FiMessageSquare className="h-5 w-5" />
              <span>AI Assistant</span>
            </button>
            
            {/* Slide Navigation */}
            <div className="flex items-center space-x-2">
              <button
                onClick={goToPreviousSlide}
                disabled={activeSlideIndex === 0}
                className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              <span className="text-sm text-gray-600">
                Slide {activeSlideIndex + 1} of {slides.length}
              </span>
              <button
                onClick={goToNextSlide}
                disabled={activeSlideIndex === slides.length - 1}
                className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* Save */}
            {saving && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiLoader className="h-4 w-4 animate-spin" />
                Saving...
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleDeleteSlide}
              disabled={slides.length === 1 || saving}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiTrash2 className="h-5 w-5" />
              <span>Delete Slide</span>
            </button>
            
            <button
              onClick={toggleExportModal}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-700 text-white rounded-lg hover:bg-indigo-600 transition-colors"
            >
              <FiDownload className="h-5 w-5" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Editor/Preview */}
        <div className="flex-1 overflow-auto p-8 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            {slides[activeSlideIndex] && (
              isPreview ? (
                <SlidePreview slide={slides[activeSlideIndex]} />
              ) : (
                <>
                  <SlideEditor
                    slide={slides[activeSlideIndex]}
                    onUpdate={handleSlideUpdate}
                  />
                  <div className="mt-8">
                    <SlideRegenerator
                      slide={slides[activeSlideIndex]}
                      onRegenerate={handleRegenerateSlide}
                    />
                  </div>
                </>
              )
            )}
          </div>
        </div>
      </div>

      {/* Export */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Export Presentation</h2>
              <button
                onClick={toggleExportModal}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full transition-colors"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <ExportOptions deck={deck} slides={slides} />
            </div>
          </div>
        </div>
      )}

      {/* AI Chatbot */}
      <AIChatbot
        slide={slides[activeSlideIndex]}
        deck={deck}
        isOpen={isChatOpen}
        onToggle={toggleChatbot}
      />
    </div>
  );
};

export default Editor;