import { useState } from 'react';

const SlideRegenerator = ({ slide, onRegenerate }) => {
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegenerate = async () => {
    if (!feedback.trim()) return;

    setLoading(true);

    // Simulate API/LLM regeneration (replace with real call later)
    setTimeout(() => {
      const regeneratedSlide = {
        ...slide,
        content: `${slide.content} (Updated based on feedback: "${feedback}")`
      };

      onRegenerate(regeneratedSlide);
      setLoading(false);
      setFeedback('');
    }, 1000);
  };

  return (
    <div className="mt-6 bg-white rounded-lg p-4 shadow-sm border border-gray-200">
      <label className="block text-gray-700 font-medium mb-2">
        Regenerate this slide based on your feedback:
      </label>
      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="E.g., make this slide more engaging"
        className="w-full border rounded p-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
        rows={3}
      />
      <button
        onClick={handleRegenerate}
        disabled={!feedback.trim() || loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {loading ? 'Regenerating...' : 'Regenerate Slide'}
      </button>
    </div>
  );
};

export default SlideRegenerator;