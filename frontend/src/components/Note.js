import React, { useState, useRef, useEffect } from 'react';
import TaskNote from './TaskNote';

const Note = ({ note, onDelete, onUpdate, dragHandleProps }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditingTitle, setIsEditingTitle] = useState(!note.title);
  const [title, setTitle] = useState(note.title || '');
  const [content, setContent] = useState(note.content || '');
  const [localNote, setLocalNote] = useState(note);
  const clickTimeoutRef = useRef(null);
  const updateTimeoutRef = useRef(null);
  const textareaRef = useRef(null);

  // Update localNote when props change
  useEffect(() => {
    setLocalNote(note);
  }, [note]);

  const updateNote = async (updates) => {
    try {
      const updatedNote = {
        ...localNote,
        ...updates,
        title,
        order: note.order,
        type: note.type
      };

      const response = await fetch(`http://localhost:5000/api/notes/${note._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedNote),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const savedNote = await response.json();
      setLocalNote(savedNote);
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const handleTitleChange = (e) => {
    e.stopPropagation();
    setTitle(e.target.value);
  };

  const handleTitleBlur = async () => {
    setIsEditingTitle(false);
    await updateNote({ title });
  };

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    updateTimeoutRef.current = setTimeout(() => {
      updateNote({ content: newContent });
    }, 500);
  };

  const handleNoteUpdate = (updates) => {
    setLocalNote(prev => ({ ...prev, ...updates }));
    
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    updateTimeoutRef.current = setTimeout(() => {
      updateNote(updates);
    }, 500);
  };

  const handleHeaderClick = (e) => {
    if (isEditingTitle) return;

    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
      setIsEditingTitle(true);
      return;
    }

    clickTimeoutRef.current = setTimeout(() => {
      setIsExpanded(!isExpanded);
      clickTimeoutRef.current = null;
    }, 200);
  };

  const renderContent = () => {
    if (note.type === 'task') {
      return (
        <div className="note-content">
          <TaskNote note={localNote} onUpdate={handleNoteUpdate} />
        </div>
      );
    }
    
    return (
      <div className="note-content">
        <textarea
          ref={textareaRef}
          value={content}
          placeholder="Enter note content..."
          onChange={handleContentChange}
          className="content-textarea"
        />
      </div>
    );
  };

  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div 
      className={`note ${isExpanded ? 'expanded' : ''}`}
      tabIndex={-1}  // This makes the div focusable
    >
      <div 
        className={`note-header ${isEditingTitle ? 'editing' : ''}`}
        onClick={handleHeaderClick}
        {...dragHandleProps}
      >
        {isEditingTitle ? (
          <input
            className="title-input"
            value={title}
            placeholder="Enter title..."
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div className="title-display">{title || 'Untitled'}</div>
        )}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onDelete(note._id);
          }}
          className="delete-button"
        >
          ×
        </button>
      </div>
      
      {isExpanded && renderContent()}
    </div>
  );
};

export default Note;