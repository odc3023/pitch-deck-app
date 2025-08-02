# Pitch Deck Backend

This is the backend for the AI-powered pitch deck platform, built with NestJS, PostgreSQL,Firebase Auth, and OpenAI GPT-4. 
It powers pitch deck creation, slide management, AI content generation, and exporting to PDF or PPTX.

---

## Features

- AI-generated pitch decks and slide content using GPT-4
- Firebase-secured user authentication
- Full CRUD for decks and slides
- AI image suggestions and speaker notes
- Export decks as PDF or PowerPoint (PPTX)
- Built with NestJS + TypeORM + PostgreSQL
- Modular, production-ready architecture

---

## Prerequisites

- Node.js (v18+)
- PostgreSQL (v13+)
- Firebase project with Authentication enabled
- OpenAI API key

---

## Installation & Setup

```bash
# Clone the repo
git clone https://github.com/odc3023/pitch-deck-app.git
cd pitch-deck-app/backend

# Install dependencies
npm install

# Copy env config
cp .env.example .env

**## Update .env with your configuration**

**Configure .env file**

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=pitch_deck_db

# Firebase (from Service Account)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY=

# OpenAI
OPENAI_API_KEY=sk-your-key

# App
PORT=3000
NODE_ENV=development

**Database**
createdb pitch_deck_db
pg_dump -U postgres -d pitch_deck_db > pitch_deck_db_dump.sql

**Running the Server**
# Development
npm run start:dev

# Production
npm run build
npm start
