import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Note from './Note';
import CabinetHeader from './cabinets/CabinetHeader';
import FloatingToolbar from './ui/FloatingToolbar';
import { EditorProvider } from './EditorContext';
import '../styles/App.css';
import '../styles/Note.css';

// Create a new context for toolbar state
export const ToolbarContext = createContext();

export const useToolbar = () => {
  const context = useContext(ToolbarContext);
  if (!context) {
    throw new Error('useToolbar must be used within a ToolbarProvider');
  }
  return context;
};

function App() {
  const [notes, setNotes] = useState([]);
  const [cabinets, setCabinets] = useState([]);
  const [currentCabinet, setCurrentCabinet] = useState(null);
  const [isToolbarEnabled, setIsToolbarEnabled] = useState(false);
  const contentWrapperRef = useRef(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    loadCabinets();
  }, []);

  const loadCabinets = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/cabinets', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setCabinets(data);

      // Handle cabinet selection
      if (isInitialLoad) {
        const lastCabinetId = localStorage.getItem('lastCabinetId');
        const lastUsedCabinet = data.find(c => c._id === lastCabinetId);
        const defaultCabinet = data.find(c => c.name === 'Default Cabinet');
        
        if (lastUsedCabinet) {
          setCurrentCabinet(lastUsedCabinet);
          await loadNotes(lastUsedCabinet._id);
        } else if (defaultCabinet) {
          setCurrentCabinet(defaultCabinet);
          await loadNotes(defaultCabinet._id);
        } else if (data.length > 0) {
          setCurrentCabinet(data[0]);
          await loadNotes(data[0]._id);
        }
        setIsInitialLoad(false);
      }
    } catch (error) {
      console.error('Error loading cabinets:', error);
    }
  };

  const loadNotes = async (cabinetId) => {
    if (!cabinetId) return;
    
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
      setNotes([]);
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
      setCabinets(prev => [...prev, newCabinet]);
      setCurrentCabinet(newCabinet);
      setNotes([]); // Reset notes for new cabinet
      localStorage.setItem('lastCabinetId', newCabinet._id);
      return newCabinet;
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
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to delete cabinet: ${response.status}`);
      }

      setCabinets(prev => prev.filter(c => c._id !== cabinetId));
      
      // If the deleted cabinet was the current one, switch to Default Cabinet
      if (currentCabinet?._id === cabinetId) {
        const defaultCabinet = cabinets.find(c => c.name === 'Default Cabinet');
        if (defaultCabinet) {
          await handleCabinetChange(defaultCabinet);
          localStorage.setItem('lastCabinetId', defaultCabinet._id);
        }
      }
    } catch (error) {
      console.error('Error deleting cabinet:', error);
      throw error;
    }
  };

  const createNote = async (type = 'standard') => {
    if (!currentCabinet) {
      console.warn('No cabinet selected');
      return;
    }
    
    try {
      const maxOrder = notes.length > 0 
        ? Math.max(...notes.map(note => note.order || 0))
        : -1;

      const noteData = {
        title: '',
        content: '',
        type,
        timestamp: new Date().toISOString(),
        order: maxOrder + 1000,
        cabinet_id: currentCabinet._id
      };

      // Add type-specific initial data
      if (type === 'task') {
        noteData.tasks = [];
      } else if (type === 'calendar') {
        noteData.viewType = 'month';
        noteData.calendarData = [];
        noteData.views = [{
          id: 'view-1',
          viewType: 'month',
          selectedDate: new Date().toISOString()
        }];
      }

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
      setNotes(prevNotes => [...prevNotes, newNote]);
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const deleteNote = async (noteId) => {
    try {
      // Optimistically update UI
      setNotes(prevNotes => prevNotes.filter(note => note._id !== noteId));

      const response = await fetch(`http://localhost:5001/api/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to delete note: ${response.status}`);
      }

      // If deletion fails, we'll reload the notes
      if (response.status !== 200) {
        await loadNotes(currentCabinet._id);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      // Reload notes to restore state in case of error
      await loadNotes(currentCabinet._id);
    }
  };

  // Rest of the component implementation remains the same...
  
  return (
    <ToolbarContext.Provider value={{ isEnabled: isToolbarEnabled, setIsEnabled: setIsToolbarEnabled }}>
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
              isCreateDisabled={!currentCabinet}
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
                              onEditorFocus={() => setIsToolbarEnabled(true)}
                              onEditorBlur={() => setIsToolbarEnabled(false)}
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
    </ToolbarContext.Provider>
  );
}

export default App;