# NotesManager - Modern Note-Taking Application

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![Flask](https://img.shields.io/badge/Flask-2.0.0+-green.svg)](https://flask.palletsprojects.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4.0.0+-green.svg)](https://www.mongodb.com/)

A sophisticated full-stack note-taking application built with React and Flask, featuring real-time updates, rich text editing, and organizational capabilities through a cabinet system.

## 🌟 Key Features

- **Rich Text Editing**: Advanced WYSIWYG editor with formatting options
- **Multiple Note Types**: 
  - Standard Notes with rich text
  - Task Lists with checkboxes
  - Calendar Notes with month/week views
- **Organization System**: Cabinet-based organization for notes
- **Drag & Drop**: Intuitive note reordering
- **Real-time Updates**: Automatic saving and synchronization
- **Responsive Design**: Seamless experience across devices

![App Demo](https://media.giphy.com/media/DEPy53Pnm71535lhVU/giphy.gif)

## 🛠️ Technology Stack

### Frontend
- **React 18**: Modern UI library for building interactive interfaces
- **TipTap**: Powerful rich text editor framework
- **TailwindCSS**: Utility-first CSS framework
- **React Beautiful DND**: Drag-and-drop functionality
- **Lucide Icons**: Modern icon library
- **Webpack**: Module bundling and development server

### Backend
- **Flask**: Lightweight Python web framework
- **MongoDB**: NoSQL database for flexible data storage
- **PyMongo**: MongoDB driver for Python
- **CORS**: Cross-Origin Resource Sharing support
- **Bleach**: HTML sanitization

## 📋 Prerequisites

- Node.js (v16.0.0+)
- Python (v3.8+)
- MongoDB (v4.0.0+)

## 🚀 Getting Started

### Frontend Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/notes-manager.git

# Navigate to frontend directory
cd notes-manager/frontend

# Install dependencies
npm install

# Start development server
npm start
```

### Backend Setup
```bash
# Navigate to backend directory
cd ../backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
source venv/bin/activate  # Unix/macOS
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Start the server
python run.py
```

## 🔧 Configuration

### Environment Variables
```env
# Backend (.env)
MONGO_URI=mongodb://localhost:27017/notes_manager
SECRET_KEY=your-secret-key-here
```

## 🧪 Testing

```bash
# Frontend tests
npm test

# Backend tests
python -m pytest
```

## 📝 API Documentation

The NotesManager API provides endpoints for managing notes and cabinets.

### Core Endpoints

#### Notes
- `GET /api/notes` - List all notes
- `GET /api/notes?cabinet_id={id}` - Get notes in cabinet
- `POST /api/notes` - Create note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

#### Cabinets
- `GET /api/cabinets` - List all cabinets
- `POST /api/cabinets` - Create cabinet
- `PUT /api/cabinets/:id` - Update cabinet
- `DELETE /api/cabinets/:id` - Delete cabinet

### Example Request
```javascript
// Create a new note
fetch('http://localhost:5001/api/notes', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'My Note',
    content: 'Note content',
    cabinet_id: 'cabinet_id'
  })
})
```

## 🧪 Testing
- **Robot Framework**: End-to-end automated testing with SeleniumLibrary
  - Note: I Created a testing roadmap at the beginning of the project, but I have no current plans to finish all the testing suites
  - Testing Roadmap can be found in the root of the tests directory

![Automated Tests Running](https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExemhiZGI5dG10Ym5ubjFjMXlmZTVmYzhvZHB3YnVhbDk3Y3V2Z3ZmZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/G5l750DD0HBMnu2MRU/giphy.gif))

## 💡 Development Practices

- **Modular Architecture**: Organized component structure with clear separation of concerns
- **Code Quality**: Clean, well-commented code with consistent formatting
- **Security**: Input validation, HTML sanitization, and CORS configuration
- **Error Handling**: Comprehensive error handling throughout the application
- **State Management**: Efficient state management using React Context and hooks

## 🎯 Future Enhancements

- [ ] User Authentication
- [ ] Tags and Categories
- [ ] Theming
