import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5000';

function App() {
  const [notes, setNotes] = useState([]);
  const [newNoteTitle, setNewNoteTitle] = useState('');

  const fetchNotes = async () => {
    try {
      const response = await fetch(`${API_URL}/api/notes`);
      console.log('Raw response:', response);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received data:', data);
      setNotes(data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const createNote = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newNoteTitle,
          content: '',
          type: 'standard',
          timestamp: new Date().toISOString()
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Created note:', data);
      setNotes([...notes, data]);
      setNewNoteTitle('');
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Notes Manager</h1>
      
      <form onSubmit={createNote} style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={newNoteTitle}
          onChange={(e) => setNewNoteTitle(e.target.value)}
          placeholder="Enter note title"
          style={{ marginRight: '10px', padding: '5px' }}
        />
        <button type="submit" style={{ padding: '5px 10px' }}>
          Add Note
        </button>
      </form>

      <div>
        {notes.length === 0 ? (
          <p>No notes yet. Create one!</p>
        ) : (
          notes.map((note) => (
            <div 
              key={note._id} 
              style={{ 
                border: '1px solid #ccc',
                padding: '10px',
                marginBottom: '10px',
                borderRadius: '4px'
              }}
            >
              <h3>{note.title}</h3>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;