import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Menu, X, User, LogOut, Plus, Eye, Trash2, Edit } from 'lucide-react'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleCreateNew = () => {
    navigate('/generate');
  };

  const handleViewProfile = () => {
    navigate('/profile');
    setIsUserMenuOpen(false);
    setIsMenuOpen(false);
  };

  const handleUpdateProfile = () => {
    navigate('/profile/edit');
    setIsUserMenuOpen(false);
    setIsMenuOpen(false);
  };


  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="text-xl font-bold text-gray-800">PitchDeck AI</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">            
            <button
              onClick={handleCreateNew}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 font-medium shadow-md"
            >
              <Plus className="h-5 w-5" />
              Create New Deck
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 p-2 rounded-md transition-colors"
              >
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <User size={18} />
                </div>
                <span className="hidden sm:block font-medium">{user?.name || 'User'}</span>
              </button>

              {/* User Dropdown */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 border">
                  {/* User Info Header */}
                  <div className="px-4 py-3 text-sm text-gray-700 border-b bg-gray-50">
                    <p className="font-medium text-gray-900">{user?.name || 'User Name'}</p>
                    <p className="text-gray-500 truncate">{user?.email?.substring(0, 2) + '***@***.com' || 'Protected Email'}</p>
                  </div>

                  {/* Profile Actions */}
                  <div className="py-1">
                    <button
                      onClick={handleViewProfile}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Eye size={16} className="mr-3 text-gray-400" />
                      View Profile
                    </button>
                    
                    <button
                      onClick={handleUpdateProfile}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Edit size={16} className="mr-3 text-gray-400" />
                      Edit Profile
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="border-t py-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={16} className="mr-3" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-800 transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-2">
              <Link
                to="/dashboard"
                className="text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                📊 My Decks
              </Link>
              
              <button
                onClick={handleCreateNew}
                className="bg-indigo-600 text-white px-3 py-2 rounded-md transition-colors flex items-center gap-2 w-fit"
              >
                <Plus size={16} />
                Create New Deck
              </button>

              {/* Mobile User Section */}
              <div className="border-t pt-2 mt-2">
                <div className="px-3 py-2 text-sm">
                  <p className="font-medium text-gray-900">{user?.name || 'User Name'}</p>
                  <p className="text-gray-500">{user?.email?.substring(0, 2) + '***@***.com' || 'Protected Email'}</p>
                </div>
                
                {/* Mobile Profile Actions */}
                <button
                  onClick={handleViewProfile}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <Eye size={16} className="mr-2" />
                  View Profile
                </button>
                
                <button
                  onClick={handleUpdateProfile}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <Edit size={16} className="mr-2" />
                  Edit Profile
                </button>
              
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:text-red-800 transition-colors border-t mt-2 pt-2"
                >
                  <LogOut size={16} className="mr-2" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Overlay for mobile menu */}
      {isMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-25 z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </nav>
  )
}

export default Navbar