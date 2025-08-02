**Pitch Deck Frontend**
---
This is the frontend for the AI-powered pitch deck platform, built with React, Vite, Firebase Auth, and Tailwind CSS. It provides an intuitive interface for creating, editing, and managing AI-generated pitch decks with real-time collaboration features.

---

## Features
AI Deck Generation - Create complete pitch decks using GPT-4
Interactive Slide Editor - Rich text editing with real-time preview
AI Assistant Chatbot - Get content suggestions and improvements
Slide Management - Drag-and-drop reordering and CRUD operations
Export Options - Download as PDF or PowerPoint (PPTX)
Firebase Authentication - Secure user management
Responsive Design - Works on desktop, tablet, and mobile
Real-time Updates - Live editing and saving

---

## Prerequisites
Node.js (v18+)
npm or yarn
Firebase project with Authentication enabled
Backend API server running

---

## Installation & Setup

# Clone the repo
git clone https://github.com/odc3023/pitch-deck-app.git
cd pitch-deck-app

# Install dependencies
npm install

# Copy env config
cp .env.example .env

---
## Configure .env file

# API Configuration
VITE_API_URL=http://localhost:3000

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

**Firebase Setup**
Create a Firebase project at https://console.firebase.google.com
Enable Authentication with Email/Password provider
Get your Firebase config from Project Settings
Add your domain to authorized domains in Authentication settings


--- 
## Running the Application

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint

