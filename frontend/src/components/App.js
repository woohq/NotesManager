import React, { useState, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Note from './Note';
import CabinetHeader from './cabinets/CabinetHeader';
import FloatingToolbar from './ui/FloatingToolbar';
import { EditorProvider } from './EditorContext';
import '../styles/App.css';
import '../styles/Note.css';

function App() {
  const [notes, setNotes] = useState([]);
  const [cabinets, setCabinets] = useState([]);
  const [currentCabinet, setCurrentCabinet] = useState(null);
  const contentWrapperRef = useRef(null);

  useEffect(() => {
    loadCabinets();
  }, []);

const fetchConfig = {
  headers: {
    'Content-Type': 'application/json'
  },
  credentials: 'include'
};

// Example usage in your loadCabinets function
const loadCabinets = async () => {
  try {
    const response = await fetch('http://localhost:5001/api/cabinets', {
      method: 'GET',
      ...fetchConfig
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    setCabinets(data);

    const lastCabinetId = localStorage.getItem('lastCabinetId');
    const defaultCabinet = data.find(c => c._id === lastCabinetId) || data[0];
    if (defaultCabinet) {
      setCurrentCabinet(defaultCabinet);
      loadNotes(defaultCabinet._id);
    }
  } catch (error) {
    console.error('Error loading cabinets:', error);
  }
};

  const loadNotes = async (cabinetId) => {
    try {
      const response = await fetch(`http://localhost:5001/api/notes?cabinet_id=${cabinetId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setNotes(data);
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const handleCabinetChange = async (cabinet) => {
    setCurrentCabinet(cabinet);
    localStorage.setItem('lastCabinetId', cabinet._id);
    await loadNotes(cabinet._id);
  };

  const handleCabinetCreate = async (name) => {
    try {
      const response = await fetch('http://localhost:5001/api/cabinets', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name })
      });

      if (!response.ok) {
        throw new Error(`Failed to create cabinet: ${response.status}`);
      }

      const newCabinet = await response.json();
      setCabinets([...cabinets, newCabinet]);
      await handleCabinetChange(newCabinet);
    } catch (error) {
      console.error('Error creating cabinet:', error);
      throw error;
    }
  };

  const handleCabinetDelete = async (cabinetId) => {
    try {
      const response = await fetch(`http://localhost:5001/api/cabinets/${cabinetId}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to delete cabinet: ${response.status}`);
      }

      setCabinets(cabinets.filter(c => c._id !== cabinetId));
      
      if (currentCabinet._id === cabinetId) {
        const defaultCabinet = cabinets.find(c => c.name === 'Default Cabinet');
        await handleCabinetChange(defaultCabinet);
      }
    } catch (error) {
      console.error('Error deleting cabinet:', error);
      throw error;
    }
  };

  const createNote = async (type = 'standard') => {
    if (!currentCabinet) return;
    
    try {
      const maxOrder = Math.max(...notes.map(note => note.order || 0), -1);
      const noteData = {
        title: '',
        content: '',
        type,
        timestamp: new Date().toISOString(),
        order: maxOrder + 1000,
        cabinet_id: currentCabinet._id,
        ...(type === 'task' ? { tasks: [] } : {}),
        ...(type === 'calendar' ? {
          viewType: 'month',
          calendarData: []
        } : {})
      };

      const response = await fetch('http://localhost:5001/api/notes', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(noteData)
      });

      if (!response.ok) {
        throw new Error(`Failed to create note: ${response.status}`);
      }

      const newNote = await response.json();
      setNotes([...notes, newNote]);
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const deleteNote = async (noteId) => {
    try {
      const response = await fetch(`http://localhost:5001/api/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to delete note: ${response.status}`);
      }

      setNotes(notes.filter(note => note._id !== noteId));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const reorderNotes = async (startIndex, endIndex) => {
    const reorderedNotes = Array.from(notes);
    const [removed] = reorderedNotes.splice(startIndex, 1);
    reorderedNotes.splice(endIndex, 0, removed);

    const updatedNotes = reorderedNotes.map((note, index) => ({
      ...note,
      order: index * 1000
    }));

    setNotes(updatedNotes);

    try {
      await Promise.all(updatedNotes.map(note => 
        fetch(`http://localhost:5001/api/notes/${note._id}`, {
          method: 'PUT',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...note,
            cabinet_id: currentCabinet._id
          })
        })
      ));
    } catch (error) {
      console.error('Error updating note orders:', error);
      loadNotes(currentCabinet._id);
    }
  };

  if (!currentCabinet) return null;

  return (
    <EditorProvider>
      <div className="app-container">
        <FloatingToolbar />
        <div className="content-wrapper" ref={contentWrapperRef}>
          <CabinetHeader
            cabinets={cabinets}
            currentCabinet={currentCabinet}
            onCabinetChange={handleCabinetChange}
            onCabinetCreate={handleCabinetCreate}
            onCabinetDelete={handleCabinetDelete}
            onCreateNote={createNote}
          />
          
          <DragDropContext onDragEnd={(result) => {
            if (!result.destination) return;
            if (result.destination.index === result.source.index) return;
            reorderNotes(result.source.index, result.destination.index);
          }}>
            <Droppable droppableId="droppable">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="notes-container"
                >
                  {notes.map((note, index) => (
                    <Draggable
                      key={note._id}
                      draggableId={note._id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                        >
                          <Note
                            note={note}
                            onDelete={deleteNote}
                            dragHandleProps={provided.dragHandleProps}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </div>
    </EditorProvider>
  );
}

export default App;