import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Note from './Note';
import CabinetHeader from './cabinets/CabinetHeader';
import FloatingToolbar from './ui/FloatingToolbar';
import { EditorProvider } from './EditorContext';
import '../styles/App.css';
import '../styles/Note.css';

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
  const [isDragging, setIsDragging] = useState(false);

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
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to create cabinet: ${response.status}`);
      }
  
      const newCabinet = await response.json();
      setCabinets(prev => [...prev, newCabinet]);
      setCurrentCabinet(newCabinet);
      setNotes([]); 
      localStorage.setItem('lastCabinetId', newCabinet._id);
      return newCabinet;
    } catch (error) {
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

      const updatedCabinets = cabinets.filter(c => c._id !== cabinetId);
      setCabinets(updatedCabinets);

      if (updatedCabinets.length === 0) {
        setCurrentCabinet(null);
        setNotes([]);
        localStorage.removeItem('lastCabinetId');
      }
      else if (currentCabinet?._id === cabinetId) {
        const defaultCabinet = updatedCabinets.find(c => c.name === 'Default Cabinet')
          || updatedCabinets[0];
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
    if (!currentCabinet) return;
    
    try {
      const maxOrder = Math.max(...notes.map(note => note.order || 0), -1);
      
      let typeSpecificData = {};
      if (type === 'task') {
        typeSpecificData = { tasks: [], type: 'task' };
      } else if (type === 'calendar') {
        typeSpecificData = {
          type: 'calendar',
          viewType: 'month',
          calendarData: []
        };
      } else {
        typeSpecificData = { type: 'standard' };
      }

      const noteData = {
        ...typeSpecificData, 
        title: '',
        content: '',
        timestamp: new Date().toISOString(),
        order: maxOrder + 1000,
        cabinet_id: currentCabinet._id
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

      if (response.status !== 200) {
        await loadNotes(currentCabinet._id);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      await loadNotes(currentCabinet._id);
    }
  };

  const reorderNotes = async (sourceIndex, destinationIndex) => {
    const originalNotes = [...notes];
    
    const reorderedNotes = Array.from(notes);
    const [movedNote] = reorderedNotes.splice(sourceIndex, 1);
    reorderedNotes.splice(destinationIndex, 0, movedNote);

    const notesWithNewOrder = reorderedNotes.map((note, index) => ({
        ...note,
        order: index * 1000
    }));

    const orderUpdates = notesWithNewOrder.map(note => ({
        _id: note._id,
        order: note.order
    }));

    setNotes(notesWithNewOrder);

    try {
        const response = await fetch('http://localhost:5001/api/notes/batch-update-order', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderUpdates)
        });

        if (!response.ok) {
            throw new Error(`Failed to update note order: ${response.status}`);
        }

        const updatedNotesResponse = await response.json();
        
        const ordersMatch = notesWithNewOrder.every((note, index) => 
            note.order === updatedNotesResponse[index].order
        );
        
        if (!ordersMatch) {
            setNotes(updatedNotesResponse);
        }
    } catch (error) {
        console.error('Error updating note order:', error);
        setNotes(originalNotes);
    }
};

const onDragStart = () => {
  setIsDragging(true);
};

const onDragEnd = async (result) => {
  setIsDragging(false);
  
  if (!result.destination) return;

  if (result.destination.index === result.source.index) {
    return;
  }

  await reorderNotes(
    result.source.index,
    result.destination.index
  );
};


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

          <DragDropContext 
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          >
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
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          style={{
                            position: 'relative',
                            ...provided.draggableProps.style
                          }}
                          {...provided.draggableProps}
                          className={`note-wrapper ${snapshot.isDragging ? 'dragging' : ''}`}
                        >
                          <Note
                            note={note}
                            onDelete={deleteNote}
                            dragHandleProps={provided.dragHandleProps}
                            onEditorFocus={() => setIsToolbarEnabled(true)}
                            onEditorBlur={() => setIsToolbarEnabled(false)}
                            isDragging={snapshot.isDragging}
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