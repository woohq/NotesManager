import React, { useState, useRef, useEffect } from 'react';

const Note = ({ note, onDelete, onUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditingTitle, setIsEditingTitle] = useState(true);
  const [title, setTitle] = useState(note.title || '');
  const [content, setContent] = useState(note.content || '');
  const [isNewNote] = useState(!note.title);
  const clickTimeoutRef = useRef(null);
  const updateTimeoutRef = useRef(null);
  const textareaRef = useRef(null);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [content]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
        updateNote(content);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
        updateNote(content);
      }
    };
  }, [content]);

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

  const updateNote = async (contentToSave) => {
    try {
      const response = await fetch(`http://localhost:5000/api/notes/${note._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...note,
          title,
          content: contentToSave
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    
    if (isNewNote && !title.trim()) {
      onDelete(note._id);
      return;
    }
    
    if (title !== note.title) {
      updateNote(content);
    }
  };

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    updateTimeoutRef.current = setTimeout(() => {
      updateNote(newContent);
    }, 500);
  };

  const handleContentBlur = () => {
    updateNote(content);
  };

  const handleHeaderClick = (e) => {
    if (isEditingTitle) return;

    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
      return;
    }

    clickTimeoutRef.current = setTimeout(() => {
      setIsExpanded(!isExpanded);
      clickTimeoutRef.current = null;
    }, 200);
  };

  const handleHeaderDoubleClick = (e) => {
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }
    
    setIsEditingTitle(true);
  };

  return (
    <div className={`note ${isExpanded ? 'expanded' : ''}`}>
      <div 
        className={`note-header ${isEditingTitle ? 'editing' : ''}`}
        onClick={handleHeaderClick}
        onDoubleClick={handleHeaderDoubleClick}
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
      
      {isExpanded && (
        <div className="note-content">
          <textarea
            ref={textareaRef}
            value={content}
            placeholder="Enter note content..."
            onChange={handleContentChange}
            onBlur={handleContentBlur}
            className="content-textarea"
          />
        </div>
      )}
    </div>
  );
};

export default Note;