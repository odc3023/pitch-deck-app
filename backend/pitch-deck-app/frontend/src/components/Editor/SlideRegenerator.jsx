import { useState } from 'react';
import { aiAPI } from '../../utils/api';
import { FiRefreshCw, FiLoader, FiMessageSquare } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

/**
 * SlideRegenerator Component
 * Allows users to regenerate slide content using AI with different feedback types
 */
const SlideRegenerator = ({ slide, onRegenerate }) => {
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [regenerationType, setRegenerationType] = useState('feedback');

  /**
   * Handles slide regeneration with AI
   * Validates input and sends request to AI API
   */
  const handleRegenerate = async () => {
    // Validation checks
    if (!slide) {
      toast.error('No slide selected for regeneration');
      return;
    }

    if (!slide.title || slide.title.trim().length === 0) {
      toast.error('Slide title is required for regeneration');
      return;
    }

    if (!slide.content || slide.content.trim().length === 0) {
      toast.error('Slide content is required for regeneration');
      return;
    }

    if (!feedback.trim() && regenerationType === 'feedback') {
      toast.error('Please provide feedback for regeneration');
      return;
    }

    setLoading(true);

    try {
      // Prepare request data for AI API
      const regenerationRequest = {
        title: slide.title.trim(),
        content: slide.content.trim(),
        type: slide.type || 'content',
        context: getRegenerationInstructions()
      };

      const response = await aiAPI.regenerateSlide(regenerationRequest);

      // Check if response is successful and has valid content
      if (response.data.success && response.data.data) {
        const newContent = response.data.data.content || slide.content;
        const newTitle = response.data.data.title || slide.title;
        
        // Check if AI actually failed to regenerate
        if (newContent.includes('Regeneration failed') || 
            newContent.includes('Please try again') ||
            newContent === slide.content) {
          throw new Error('AI regeneration service is currently unavailable');
        }

        // Create updated slide object
        const regeneratedSlide = {
          ...slide,
          title: newTitle,
          content: newContent,
          imageSuggestions: response.data.data.imageSuggestions || slide.imageSuggestions || []
        };

        onRegenerate(regeneratedSlide);
        setFeedback('');
        toast.success('Slide regenerated successfully!');
        
      } else {
        throw new Error(response.data.error || 'Regeneration failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to regenerate slide';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Returns appropriate instructions based on regeneration type
   */
  const getRegenerationInstructions = () => {
    switch (regenerationType) {
      case 'style':
        return 'Improve the writing style and tone while keeping the same content structure';
      case 'length':
        return 'Adjust the content length - make it more concise or more detailed as appropriate';
      case 'feedback':
      default:
        return feedback.trim();
    }
  };

  /**
   * Returns placeholder text for different regeneration types
   */
  const getPlaceholderText = () => {
    switch (regenerationType) {
      case 'style':
        return 'The AI will improve the writing style and tone automatically';
      case 'length':
        return 'The AI will adjust the content length automatically';
      case 'feedback':
      default:
        return 'E.g., "Make this slide more engaging and add specific examples" or "Focus more on the benefits rather than features"';
    }
  };

  // Pre-defined feedback options for quick selection
  const quickFeedbackOptions = [
    'Make it more engaging and conversational',
    'Add more specific examples and data',
    'Make it more concise and to the point',
    'Focus more on benefits rather than features',
    'Make it more professional and formal',
    'Add more visual appeal suggestions'
  ];

  return (
    <div className="mt-8 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-6">
        {/* Header Section */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <FiRefreshCw className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Regenerate Slide with AI
            </h3>
            <p className="text-sm text-gray-600">
              Provide feedback to improve this slide with AI assistance
            </p>
          </div>
        </div>

        {/* Regeneration Type Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Regeneration Type
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setRegenerationType('feedback')}
              className={`px-3 py-2 text-sm rounded-md transition-colors ${
                regenerationType === 'feedback'
                  ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                  : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
              }`}
            >
              Custom Feedback
            </button>
            <button
              onClick={() => setRegenerationType('style')}
              className={`px-3 py-2 text-sm rounded-md transition-colors ${
                regenerationType === 'style'
                  ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                  : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
              }`}
            >
              Improve Style
            </button>
            <button
              onClick={() => setRegenerationType('length')}
              className={`px-3 py-2 text-sm rounded-md transition-colors ${
                regenerationType === 'length'
                  ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                  : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
              }`}
            >
              Adjust Length
            </button>
          </div>
        </div>

        {/* Custom Feedback Input */}
        {regenerationType === 'feedback' && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Feedback
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder={getPlaceholderText()}
                className="w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>

            {/* Quick Feedback Options */}
            <div className="mb-4">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                {showAdvanced ? 'Hide' : 'Show'} Quick Feedback Options
              </button>
              
              {showAdvanced && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {quickFeedbackOptions.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => setFeedback(option)}
                      className="text-left p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-md border border-gray-200 transition-colors"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
        {/* Regeneration */}
        {regenerationType !== 'feedback' && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-700">
              <FiMessageSquare className="inline h-4 w-4 mr-1" />
              {getPlaceholderText()}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleRegenerate}
            disabled={loading || (regenerationType === 'feedback' && !feedback.trim())}
            className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <FiLoader className="h-4 w-4 animate-spin" />
                Regenerating...
              </>
            ) : (
              <>
                <FiRefreshCw className="h-4 w-4" />
                Regenerate Slide
              </>
            )}
          </button>
          
          {feedback && (
            <button
              onClick={() => setFeedback('')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <p className="text-xs text-gray-600">
            <strong>Tip:</strong> Be specific with your feedback. Instead of "make it better," try "add more concrete examples" or "make the tone more professional."
          </p>
        </div>
      </div>
    </div>
  );
};

export default SlideRegenerator;