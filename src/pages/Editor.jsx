import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import SlideSidebar from '../components/Editor/SlideSidebar';
import SlideEditor from '../components/Editor/SlideEditor';
import SlidePreview from '../components/Editor/SlidePreview';
import SlideRegenerator from '../components/Editor/SlideRegenerator';
import { FiPlus, FiTrash2, FiEye, FiEdit, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Editor = () => {
  const { deckId } = useParams();
  const [slides, setSlides] = useState([]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    const mockSlides = [
      { id: 'slide1', title: 'Welcome', content: 'Welcome to our pitch deck!' },
      { id: 'slide2', title: 'Problem', content: 'We solve a big problem in the industry.' },
      { id: 'slide3', title: 'Solution', content: 'Our solution is powered by AI and data.' },
    ];
    setSlides(mockSlides);
  }, [deckId]);

  const handleSlideChange = (index) => {
    setActiveSlideIndex(index);
  };

  const handleSlideUpdate = (updatedSlide) => {
    const updatedSlides = [...slides];
    updatedSlides[activeSlideIndex] = updatedSlide;
    setSlides(updatedSlides);
  };

  const handleSlideReorder = (newSlides) => {
    setSlides(newSlides);
  };

  const handleAddSlide = () => {
    const newSlide = {
      id: `slide${Date.now()}`,
      title: `Untitled Slide`,
      content: ''
    };

    const updatedSlides = [...slides];
    updatedSlides.splice(activeSlideIndex + 1, 0, newSlide);

    setSlides(updatedSlides);
    setActiveSlideIndex(activeSlideIndex + 1);
  };

  const handleDeleteSlide = () => {
    if (slides.length === 1) return alert('You must have at least one slide.');

    const updatedSlides = [...slides];
    updatedSlides.splice(activeSlideIndex, 1);

    setSlides(updatedSlides);
    setActiveSlideIndex(Math.max(0, activeSlideIndex - 1));
  };

  const goToPreviousSlide = () => {
    setActiveSlideIndex(prev => Math.max(0, prev - 1));
  };

  const goToNextSlide = () => {
    setActiveSlideIndex(prev => Math.min(slides.length - 1, prev + 1));
  };

// keyboard shortcut for slide nav
  useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      goToPreviousSlide();
    } else if (e.key === 'ArrowRight') {
      goToNextSlide();
    } else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      // Cmd+Enter on Mac 
      const currentSlide = slides[activeSlideIndex];
      const regeneratedSlide = {
        ...currentSlide,
        content: currentSlide.content + ' (Regenerated)', // placeholder for real logic
      };
      const updated = [...slides];
      updated[activeSlideIndex] = regeneratedSlide;
      setSlides(updated);
    }
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [slides, activeSlideIndex]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Slide Deck</h2>
          <p className="text-sm text-gray-500">Editing: Deck {deckId}</p>
        </div>
        
        <SlideSidebar
          slides={slides}
          activeIndex={activeSlideIndex}
          onSelectSlide={handleSlideChange}
          onReorderSlides={handleSlideReorder}
        />
        
        <div className="p-4 border-t border-gray-200 mt-auto">
          <button
            onClick={handleAddSlide}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <FiPlus className="h-5 w-5" />
            Add Slide
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsPreview(!isPreview)}
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
          </div>
          
          <button
            onClick={handleDeleteSlide}
            disabled={slides.length === 1}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiTrash2 className="h-5 w-5" />
            <span>Delete Slide</span>
          </button>
        </div>

        {/* Editor/Preview Area */}
        <div className="flex-1 overflow-auto p-8 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            {isPreview ? (
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
                    onRegenerate={(newSlide) => {
                      const updated = [...slides];
                      updated[activeSlideIndex] = newSlide;
                      setSlides(updated);
                    }}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;