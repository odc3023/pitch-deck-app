import { useState } from 'react';

const SlideEditor = ({ slide, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('content');

  const handleChange = (e) => {
    const { name, value } = e.target;
    onUpdate({ ...slide, [name]: value });
  };

  const handleNotesChange = (e) => {
    onUpdate({ ...slide, speakerNotes: e.target.value });
  };

  if (!slide) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex">
          <button
            onClick={() => setActiveTab('content')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'content'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            📄 Slide Content
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'notes'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            🎤 Speaker Notes
            {slide.speakerNotes && slide.speakerNotes.trim() && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
                ✓
              </span>
            )}
          </button>
        </nav>
      </div>

      <div className="p-6">
        {activeTab === 'content' ? (
          <div>
            {/* Slide Title */}
            <input
              type="text"
              name="title"
              value={slide.title || ''}
              onChange={handleChange}
              placeholder="Slide Title"
              className="w-full text-2xl font-bold mb-4 border-b border-gray-200 focus:outline-none focus:border-indigo-500"
            />
            
            {/* Slide Content */}
            <textarea
              name="content"
              value={slide.content || ''}
              onChange={handleChange}
              placeholder="Slide Content"
              className="w-full h-32 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />

            {/* Image Suggestions */}
            {Array.isArray(slide.imageSuggestions) && slide.imageSuggestions.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Image Suggestions</h3>
                <div className="space-y-3">
                  {slide.imageSuggestions.map((suggestion, index) => (
                    <div key={index} className="p-3 border border-gray-200 rounded-md bg-gray-50">
                      <input
                        type="text"
                        value={suggestion.description || ''}
                        onChange={(e) => {
                          const updated = [...slide.imageSuggestions];
                          updated[index] = { ...updated[index], description: e.target.value };
                          onUpdate({ ...slide, imageSuggestions: updated });
                        }}
                        placeholder="Image description"
                        className="w-full mb-2 px-3 py-1 text-sm border border-gray-300 rounded"
                      />
                      <input
                        type="text"
                        value={suggestion.altText || ''}
                        onChange={(e) => {
                          const updated = [...slide.imageSuggestions];
                          updated[index] = { ...updated[index], altText: e.target.value };
                          onUpdate({ ...slide, imageSuggestions: updated });
                        }}
                        placeholder="Alt text"
                        className="w-full px-3 py-1 text-sm border border-gray-300 rounded"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* Simple Speaker Notes */}
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Speaker Notes
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Add your presentation notes here. Use the AI Assistant to generate professional speaker notes.
              </p>
            </div>
            
            <textarea
              value={slide.speakerNotes || ''}
              onChange={handleNotesChange}
              placeholder="Enter your speaker notes here... 
              You can ask the AI Assistant to generate speaker notes for this slide."
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              rows={12}
            />
            
            <div className="mt-2 text-xs text-gray-500">
              {slide.speakerNotes?.length || 0} characters
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SlideEditor;