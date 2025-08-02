import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, MoreVertical, Edit, Trash2, Download } from 'lucide-react'

const DeckCard = ({ deck, onEdit, onDelete, onExport }) => {
  const [showDropdown, setShowDropdown] = useState(false)

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      {/* Thumbnail */}
      <div className={`h-32 ${deck.thumbnail} flex items-center justify-center cursor-pointer`}
           onClick={() => onEdit(deck.id)}>
        <div className="text-white text-center">
          <FileText size={32} className="mx-auto mb-2 opacity-80" />
          <p className="text-sm font-medium opacity-90">{deck.slideCount} slides</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-gray-800 text-lg leading-tight cursor-pointer hover:text-blue-600 transition-colors"
              onClick={() => onEdit(deck.id)}>
            {deck.title}
          </h3>
          
          {/* Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <MoreVertical size={16} className="text-gray-400" />
            </button>

            {showDropdown && (
              <>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
                  <button
                    onClick={() => {
                      onEdit(deck.id)
                      setShowDropdown(false)
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Edit size={16} className="mr-2" />
                    Edit Deck
                  </button>
                  <button
                    onClick={() => {
                      onExport(deck.id)
                      setShowDropdown(false)
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Download size={16} className="mr-2" />
                    Export
                  </button>
                  <button
                    onClick={() => {
                      onDelete(deck.id)
                      setShowDropdown(false)
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={16} className="mr-2" />
                    Delete
                  </button>
                </div>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setShowDropdown(false)}
                />
              </>
            )}
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4">
          {deck.description}
        </p>

        {/* Footer */}
        <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
          <span>Created {formatDate(deck.createdAt)}</span>
          <span>Updated {formatDate(deck.updatedAt)}</span>
        </div>

        {/* Action Button */}
        <button
          onClick={() => onEdit(deck.id)}
          className="w-full bg-gray-50 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-100 transition-colors font-medium"
        >
          Open Deck
        </button>
      </div>
    </div>
  )
}

const DeckGrid = ({ decks, onEdit, onDelete, onExport }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {decks.map((deck) => (
        <DeckCard
          key={deck.id}
          deck={deck}
          onEdit={onEdit}
          onDelete={onDelete}
          onExport={onExport}
        />
      ))}
    </div>
  )
}

export default DeckGrid