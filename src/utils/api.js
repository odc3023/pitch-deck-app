import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add Firebase token to requests automatically
api.interceptors.request.use(
  async (config) => {
    try {
      // Get Firebase token
      const { auth } = await import('../firebase')
      const user = auth.currentUser
      
      if (user) {
        const token = await user.getIdToken()
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch (error) {
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error)
  }
)

// User API
export const userAPI = {
  // Get current user profile
  getProfile: () => api.get('/users/profile'),
  
  // Sync user with database
  syncUser: () => api.post('/users/sync'),
  
  // Update user profile
  updateProfile: (userData) => api.put('/users/profile', userData),
  
  // Delete user account
  deleteAccount: () => api.delete('/users/account'),
}

// Deck API
export const deckAPI = {
  getAll: () => api.get('/decks'),
  getById: (id) => api.get(`/decks/${id}`),
  create: (deckData) => api.post('/decks', deckData),
  generate: (inputs) => api.post('/decks/generate', inputs),
  update: (id, deckData) => api.put(`/decks/${id}`, deckData),
  delete: (id) => api.delete(`/decks/${id}`),
  addSlide: (deckId, slideData) => api.post(`/decks/${deckId}/slides`, slideData),
  updateSlide: (deckId, slideId, slideData) => api.put(`/decks/${deckId}/slides/${slideId}`, slideData),
  deleteSlide: (deckId, slideId) => api.delete(`/decks/${deckId}/slides/${slideId}`),
  reorderSlides: (deckId, slideIds) => api.put(`/decks/${deckId}/reorder-slides`, { slideIds }),
}

// AI API 
export const aiAPI = {
  generateDeck: (inputs) => api.post('/ai/generate-deck', inputs),
  regenerateSlide: (slideData) => api.post('/ai/regenerate-slide', slideData),
  generateSlideWithImages: (slideData) => api.post('/ai/generate-slide-with-images', slideData),
  suggestImages: (slideData) => api.post('/ai/suggest-images', slideData),
  aiAssistant: (assistantData) => api.post('/ai/ai-assistant', assistantData),
}

// Export API
export const exportAPI = {
  toPDF: (deckId) => api.post(`/export/pdf/${deckId}`, {}, { responseType: 'blob' }),
  toPPTX: (deckId) => api.post(`/export/pptx/${deckId}`, {}, { responseType: 'blob' }),
}

export default api