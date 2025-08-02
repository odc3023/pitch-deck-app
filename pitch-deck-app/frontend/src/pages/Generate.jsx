import { useState } from 'react';
import { FiLoader, FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import { deckAPI, aiAPI } from '../utils/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Generate = () => {
  const [inputs, setInputs] = useState({
    company: '',
    industry: '',
    problem: '',
    solution: '',
    model: '',
    financials: '',
  });
  const [loading, setLoading] = useState(false);
  const [outline, setOutline] = useState(null);
  const [generatedDeckId, setGeneratedDeckId] = useState(null);
  const [currentStep, setCurrentStep] = useState(1); // 1: Input, 2: Generating, 3: Results
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: value }));
    setError(null); // Clear error when user makes changes
  };

  const handleGenerate = async () => {
    setLoading(true);
    setCurrentStep(2);
    setOutline(null);
    setError(null);

    try {
      const response = await deckAPI.generate(inputs);

      if (response.data.success) {
        const deck = response.data.data;
        
        const deckId = deck.id;
        setGeneratedDeckId(deckId);
        
        let outlineText = '';
        if (deck.slides && deck.slides.length > 0) {
          outlineText = deck.slides.map((slide, index) => 
            `${index + 1}. ${slide.title}`
          ).join('\n');
        } else {
          outlineText = `AI-generated deck created for ${inputs.company}!\n\nDeck contains starter slides ready for editing.`;
        }
        
        setOutline(outlineText);
        setCurrentStep(3);
        
        toast.success(`${inputs.company} pitch deck generated with AI!`);
      } else {
        throw new Error(response.data.error || 'Failed to generate deck');
      }
    } catch (error) {
      
      let errorMessage = 'Failed to generate pitch deck. Please try again.';
      
      if (error.response?.status === 401) {
        errorMessage = 'Please sign in to generate a pitch deck.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      setCurrentStep(1);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleContinueToEditor = () => {
    if (generatedDeckId) {
      navigate(`/editor/${generatedDeckId}`);
    } else {
      navigate('/editor');
    }
  };
  
  const fieldLabels = {
    company: 'Company Name',
    industry: 'Industry',
    problem: 'Problem Statement',
    solution: 'Your Solution',
    model: 'Business Model',
    financials: 'Key Financials'
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            AI Pitch Deck Generator
          </h1>
          <p className="mt-3 text-xl text-gray-500">
            Create a professional pitch deck in minutes
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <nav className="flex items-center justify-center">
            <ol className="flex items-center space-x-8">
              <li className={`flex items-center ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-500'}`}>
                <span className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 1 ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  {currentStep > 1 ? <FiCheckCircle className="w-5 h-5" /> : '1'}
                </span>
                <span className="ml-2 text-sm font-medium">Input Details</span>
              </li>
              <li className={`flex items-center ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-500'}`}>
                <span className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 2 ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  {currentStep > 2 ? <FiCheckCircle className="w-5 h-5" /> : '2'}
                </span>
                <span className="ml-2 text-sm font-medium">Generating</span>
              </li>
              <li className={`flex items-center ${currentStep >= 3 ? 'text-blue-600' : 'text-gray-500'}`}>
                <span className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 3 ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  3
                </span>
                <span className="ml-2 text-sm font-medium">Results</span>
              </li>
            </ol>
          </nav>
        </div>

        {/* Content Area */}
        <div className="bg-white shadow rounded-lg p-6 sm:p-8">
          {currentStep === 1 && (
            <>
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Error
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        {error}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {Object.keys(inputs).map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700">
                      {fieldLabels[field]}
                    </label>
                    {field === 'problem' || field === 'solution' ? (
                      <textarea
                        name={field}
                        value={inputs[field]}
                        onChange={handleChange}
                        rows={3}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder={`Describe your ${fieldLabels[field].toLowerCase()}`}
                      />
                    ) : (
                      <input
                        type="text"
                        name={field}
                        value={inputs[field]}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder={`Enter ${fieldLabels[field].toLowerCase()}`}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleGenerate}
                  disabled={Object.values(inputs).some(val => !val.trim()) || loading}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <FiLoader className="mr-2 h-5 w-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      Generate Deck Outline
                      <FiArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {currentStep === 2 && (
            <div className="text-center py-12">
              <div className="animate-pulse flex flex-col items-center justify-center">
                <FiLoader className="h-12 w-12 text-blue-500 animate-spin mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Creating your complete pitch deck</h3>
                <p className="mt-2 text-gray-600">
                  Our AI is generating full slides with content, layouts, and saving your deck...
                </p>
              </div>
            </div>
          )}

          {currentStep === 3 && outline && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Your Pitch Deck is Ready!</h2>
                <p className="mt-2 text-gray-600">
                  We've created a complete pitch deck with full slide content. Here's a preview of your deck structure:
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-3">DECK OVERVIEW</h3>
                <pre className="text-gray-700 whitespace-pre-wrap font-sans">{outline}</pre>
                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-700">
                    Each slide includes detailed content, speaker notes, and professional formatting
                  </p>
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <button
                  onClick={() => {
                    setCurrentStep(1);
                    setError(null);
                    setOutline(null);
                    setGeneratedDeckId(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Create New Deck
                </button>
                <button
                  onClick={handleContinueToEditor}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Edit & Customize Deck
                  <FiArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Generate;