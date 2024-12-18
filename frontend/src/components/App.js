import React, { useState, useEffect, useRef } from 'react';
import Note from './Note';
import '../styles/App.css';
import '../styles/Note.css';

const API_URL = 'http://localhost:5000';

function App() {
  const [notes, setNotes] = useState([]);
  const contentWrapperRef = useRef(null);

  const fetchNotes = async () => {
    try {
      const response = await fetch(`${API_URL}/api/notes`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setNotes(data);
      
      // Reset scroll position after notes are loaded
      if (contentWrapperRef.current) {
        contentWrapperRef.current.scrollTop = 0;
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const createNote = async () => {
    try {
      const response = await fetch(`${API_URL}/api/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: '',
          content: '',
          type: 'standard',
          timestamp: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setNotes([...notes, data]);
      
      // Scroll to bottom when new note is created
      if (contentWrapperRef.current) {
        setTimeout(() => {
          contentWrapperRef.current.scrollTop = contentWrapperRef.current.scrollHeight;
        }, 0);
      }
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const handleDelete = async (noteId) => {
    try {
      const response = await fetch(`${API_URL}/api/notes/${noteId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      setNotes(notes.filter(note => note._id !== noteId));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  return (
    <div className="app-container">
      <button onClick={createNote} className="add-note-button">
        +
      </button>
      
      <div className="content-wrapper" ref={contentWrapperRef}>
        <div className="cabinet-header">
          <h1>Default Cabinet</h1>
        </div>
        
        <div className="notes-container">
          {notes.length === 0 ? (
            <p className="no-notes">No notes yet. Create one!</p>
          ) : (
            notes.map((note) => (
              <Note
                key={note._id}
                note={note}
                onDelete={handleDelete}
                onUpdate={fetchNotes}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;