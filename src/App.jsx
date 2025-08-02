import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Common/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Editor from './pages/Editor'
import ProtectedRoute from './components/Common/ProtectedRoute'
import Generate from './pages/Generate'
import Profile from './pages/Profile'
import ProfileEdit from './pages/ProfileEdit'
import Landing from './pages/Landing'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login isLogin={true} />} />
          <Route path="/register" element={<Login isLogin={false} />} />

          {/* Protected routes with Layout */}
          <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
          <Route path="/editor/:deckId" element={<ProtectedRoute><Layout><Editor /></Layout></ProtectedRoute>} />
          <Route path="/generate" element={<ProtectedRoute><Layout><Generate /></Layout></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
          <Route path="/profile/edit" element={<ProtectedRoute><Layout><ProfileEdit /></Layout></ProtectedRoute>} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App