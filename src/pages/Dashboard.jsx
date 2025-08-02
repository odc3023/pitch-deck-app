import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { deckAPI } from '../utils/api';
import { FiEye, FiEdit, FiTrash2, FiLoader, FiCalendar, FiUser, FiPlus } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user's decks when component mounts
  useEffect(() => {
    const fetchUserDecks = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        const response = await deckAPI.getAll();
        const userDecks = response.data?.data || response.data || [];
        
        setDecks(userDecks);
        setError(null);
      } catch (error) {
        setError('Failed to load your decks');
        setDecks([]);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchUserDecks();
    }
  }, [user, authLoading]);

  const handleCreateNew = () => {
    navigate('/generate');
  };

  const handleViewDeck = (deckId) => {
    navigate(`/editor/${deckId}`);
  };

  const handleEditDeck = (deckId) => {
    navigate(`/editor/${deckId}`);
  };

  const handleDeleteDeck = async (deckId) => {
    if (!window.confirm('Are you sure you want to delete this deck?')) {
      return;
    }

    try {
      await deckAPI.delete(deckId);
      setDecks(prevDecks => prevDecks.filter(deck => deck.id !== deckId));
      toast.success('Deck deleted successfully');
    } catch (error) {
      toast.error('Failed to delete deck');
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Unknown date';
    }
  };

  const getSlideCount = (deck) => {
    if (!deck.slides) return 0;
    
    try {
      if (Array.isArray(deck.slides)) {
        return deck.slides.length;
      }
      
      if (typeof deck.slides === 'string') {
        const slides = JSON.parse(deck.slides);
        return Array.isArray(slides) ? slides.length : 0;
      }
      
      if (typeof deck.slides === 'object' && deck.slides.length !== undefined) {
        return deck.slides.length;
      }
      
      if (typeof deck.slides === 'object') {
        return Object.keys(deck.slides).length;
      }
      
      return 0;
    } catch (error) {
      return 0;
    }
  };

  // loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FiLoader className="h-8 w-8 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // auth required state
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Log In</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view your pitch decks.</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Your Pitch Decks
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your pitch decks and create new presentations
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="mt-2 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Decks Grid */}
        {decks.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 text-gray-400">
              <FiUser className="h-full w-full" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No pitch decks yet</h3>
            <p className="mt-2 text-gray-500">
              Get started by creating your first AI-powered pitch deck
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {decks.map((deck) => (
              <div
                key={deck.id}
                className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {deck.title || 'Untitled Deck'}
                    </h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDeck(deck.id)}
                        className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                        title="View deck"
                      >
                        <FiEye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditDeck(deck.id)}
                        className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                        title="Edit deck"
                      >
                        <FiEdit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteDeck(deck.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete deck"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {deck.description || 'No description available'}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                      <FiCalendar className="h-4 w-4 mr-1" />
                      {formatDate(deck.createdAt || deck.created_at)}
                    </div>
                    <span>{getSlideCount(deck)} slides</span>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-6 py-3">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleEditDeck(deck.id)}
                      className="flex-1 bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleViewDeck(deck.id)}
                      className="flex-1 bg-indigo-600 border border-transparent rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Open
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;