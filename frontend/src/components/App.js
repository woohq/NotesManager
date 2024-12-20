import React, { useState, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Note from './Note';
import '../styles/App.css';
import '../styles/Note.css';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PlusCircle, ListTodo, StickyNote } from 'lucide-react';

const API_URL = 'http://localhost:5000';

function App() {
  const [notes, setNotes] = useState([]);
  const [enabled, setEnabled] = useState(false);
  const contentWrapperRef = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const animation = requestAnimationFrame(() => {
      setEnabled(true);
    });

    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await fetch(`${API_URL}/api/notes`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setNotes(data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const createNote = async (type = 'standard') => {
    try {
      const maxOrder = Math.max(...notes.map(note => note.order || 0), -1);
      const newOrder = maxOrder + 1000;

      const noteData = {
        title: '',
        content: '',
        type: type,
        timestamp: new Date().toISOString(),
        order: newOrder
      };

      // Add type-specific initial data
      if (type === 'task') {
        noteData.tasks = [];
      }

      const response = await fetch(`${API_URL}/api/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(noteData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const newNote = await response.json();
      setNotes([...notes, newNote]);
      setIsDropdownOpen(false);
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

  const reorderNotes = async (startIndex, endIndex) => {
    try {
      const reorderedNotes = Array.from(notes);
      const [removed] = reorderedNotes.splice(startIndex, 1);
      reorderedNotes.splice(endIndex, 0, removed);

      const updatedNotes = reorderedNotes.map((note, index) => ({
        ...note,
        order: index * 1000
      }));

      setNotes(updatedNotes);

      const updatePromises = updatedNotes.map(note => 
        fetch(`${API_URL}/api/notes/${note._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: note.title || '',
            content: note.content || '',
            order: note.order,
            type: note.type || 'standard',
            tasks: note.tasks || []
          }),
        })
      );

      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error updating note orders:', error);
      fetchNotes();
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    if (result.destination.index === result.source.index) return;
    reorderNotes(result.source.index, result.destination.index);
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  return (
    <div className="app-container">
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <div className="add-note-button">
            <PlusCircle className="h-6 w-6" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 shadow-md">
          <DropdownMenuItem 
            onClick={() => createNote('standard')}
            className="flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-slate-100"
          >
            <StickyNote className="mr-2 h-4 w-4" />
            <span>Standard Note</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => createNote('task')}
            className="flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-slate-100"
          >
            <ListTodo className="mr-2 h-4 w-4" />
            <span>Task List</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <div className="content-wrapper" ref={contentWrapperRef}>
        <div className="cabinet-header">
          <h1>Default Cabinet</h1>
        </div>
        
        <DragDropContext onDragEnd={onDragEnd}>
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
                          onDelete={handleDelete}
                          onUpdate={fetchNotes}
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
  );
}

export default App;