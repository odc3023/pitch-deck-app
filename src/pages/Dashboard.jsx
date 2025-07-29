import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, FileText, Calendar, MoreVertical, Edit, Trash2, Download } from 'lucide-react'
import DeckGrid from '../components/Dashboard/DeckGrid';

// Mock data for development
const mockDecks = [
  {
    id: '1',
    title: 'TechStart AI Platform',
    description: 'Revolutionary AI platform for small businesses',
    slideCount: 12,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20',
    thumbnail: 'bg-gradient-to-br from-blue-500 to-purple-600'
  },
  {
    id: '2', 
    title: 'GreenEnergy Solutions',
    description: 'Sustainable energy for the future',
    slideCount: 8,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-18',
    thumbnail: 'bg-gradient-to-br from-green-500 to-teal-600'
  },
  {
    id: '3',
    title: 'HealthTech Mobile App',
    description: 'Connecting patients with healthcare providers',
    slideCount: 15,
    createdAt: '2024-01-05',
    updatedAt: '2024-01-17',
    thumbnail: 'bg-gradient-to-br from-red-500 to-pink-600'
  },
  {
    id: '4',
    title: 'EduLearn Platform',
    description: 'Online learning made interactive and fun',
    slideCount: 10,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
    thumbnail: 'bg-gradient-to-br from-orange-500 to-yellow-600'
  }
]

const Dashboard = () => {
  const navigate = useNavigate()
  const [activeDropdown, setActiveDropdown] = useState(null)

  const handleCreateNew = () => {
    navigate('/editor')
  }

  const handleEditDeck = (deckId) => {
    navigate(`/editor/${deckId}`)
    setActiveDropdown(null)
  }

  const handleDeleteDeck = (deckId) => {
    // TODO: Implement delete functionality
    console.log('Delete deck:', deckId)
    setActiveDropdown(null)
  }

  const handleExportDeck = (deckId) => {
    // TODO: Implement export functionality
    console.log('Export deck:', deckId)
    setActiveDropdown(null)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Pitch Decks</h1>
          <p className="text-gray-600">Create and manage your AI-powered pitch decks</p>
        </div>
        
        <button
          onClick={handleCreateNew}
          className="mt-4 sm:mt-0 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium shadow-md"
        >
          <Plus size={20} />
          Create New Deck
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Decks</p>
              <p className="text-2xl font-bold text-gray-800">{mockDecks.length}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <FileText className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Slides</p>
              <p className="text-2xl font-bold text-gray-800">
                {mockDecks.reduce((sum, deck) => sum + deck.slideCount, 0)}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <Calendar className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Recent Activity</p>
              <p className="text-2xl font-bold text-gray-800">
                {formatDate(Math.max(...mockDecks.map(d => new Date(d.updatedAt))))}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-full">
              <Edit className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {mockDecks.length === 0 ? (
        // Empty State
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="text-gray-400" size={32} />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No pitch decks yet</h3>
          <p className="text-gray-600 mb-6">
            Get started by creating your first AI-powered pitch deck
          </p>
          <button
            onClick={handleCreateNew}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
          >
            <Plus size={20} />
            Create Your First Deck
          </button>
        </div>
      ) : (
        <DeckGrid
          decks={mockDecks}
          onEdit={handleEditDeck}
          onDelete={handleDeleteDeck}
          onExport={handleExportDeck}
        />
      )}

      {/* Click outside to close dropdown */}
      {activeDropdown && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setActiveDropdown(null)}
        />
      )}
    </div>
  )
}

export default Dashboard