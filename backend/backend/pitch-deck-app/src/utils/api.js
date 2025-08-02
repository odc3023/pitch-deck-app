import axios from 'axios'

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// API endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
}

export const deckAPI = {
  getAll: () => api.get('/decks'),
  getById: (id) => api.get(`/decks/${id}`),
  create: (deckData) => api.post('/decks', deckData),
  update: (id, deckData) => api.put(`/decks/${id}`, deckData),
  delete: (id) => api.delete(`/decks/${id}`),
}

export const aiAPI = {
  generateDeck: (inputs) => api.post('/ai/generate-deck', inputs),
  regenerateSlide: (slideData) => api.post('/ai/regenerate-slide', slideData),
  chat: (message, context) => api.post('/ai/chat', { message, context }),
  generateNotes: (slideContent) => api.post('/ai/generate-notes', slideContent),
}

export const exportAPI = {
  toPDF: (deckId) => api.post(`/export/pdf/${deckId}`, {}, { responseType: 'blob' }),
  toPPTX: (deckId) => api.post(`/export/pptx/${deckId}`, {}, { responseType: 'blob' }),
}