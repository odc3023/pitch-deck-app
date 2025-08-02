import React, { useState } from 'react';
import { FiMessageSquare, FiChevronUp, FiChevronDown } from 'react-icons/fi';

const SlidePreview = ({ slide, showNotes = false }) => {
  const [notesVisible, setNotesVisible] = useState(showNotes);

  const renderImageSuggestions = () => {
    if (!slide.imageSuggestions || slide.imageSuggestions.length === 0) {
      return null;
    }

    return (
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Image Suggestions:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {slide.imageSuggestions.map((suggestion, index) => (
            <div key={index} className="bg-gray-100 rounded-lg p-4 border border-gray-200">
              <div className="bg-white rounded-md p-6 text-center mb-3">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <span className="text-gray-400 text-xs">IMG</span>
                </div>
                <p className="text-xs text-gray-600">{suggestion.altText}</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  {suggestion.type.charAt(0).toUpperCase() + suggestion.type.slice(1)}
                </p>
                <p className="text-xs text-gray-600">{suggestion.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!slide) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Existing slide content */}
      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {slide.title}
          </h1>
          <div className="w-12 h-1 bg-indigo-600 rounded"></div>
        </div>

        <div className="prose max-w-none mb-6">
          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {slide.content}
          </div>
        </div>

        {renderImageSuggestions()}
      </div>

      {/* Speaker Notes Section */}
      {slide.speakerNotes && (
        <div className="border-t border-gray-200">
          <div className="p-4 bg-gray-50">
            <button
              onClick={() => setNotesVisible(!notesVisible)}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              <FiMessageSquare className="h-4 w-4" />
              Speaker Notes
              {notesVisible ? (
                <FiChevronUp className="h-4 w-4" />
              ) : (
                <FiChevronDown className="h-4 w-4" />
              )}
            </button>
          </div>
          
          {notesVisible && (
            <div className="p-6 bg-gray-50 border-t border-gray-200">
              <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {slide.speakerNotes}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SlidePreview;