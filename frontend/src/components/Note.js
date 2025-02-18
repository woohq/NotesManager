import React, { useState, useRef, useEffect } from 'react';
import TaskNote from './TaskNote';
import CalendarNote from './CalendarNote';
import RichTextEditor from './ui/RichTextEditor';
import { useEditor } from './EditorContext';
import { sanitizeContent, cleanContent } from '@/lib/utils';

const Note = ({
  note,
  onDelete,
  dragHandleProps,
  onEditorFocus,
  onEditorBlur
}) => {
  const [isExpanded, setIsExpanded] = useState(() => {
    if (note.isExpanded !== undefined) {
      return note.isExpanded;
    }
    return note.type === 'calendar' ? true : !note.title;
  });
  const [isEditingTitle, setIsEditingTitle] = useState(!note.title);
  const [title, setTitle] = useState(note.title || '');
  const [content, setContent] = useState(cleanContent(note.content) || '');
  const [localNote, setLocalNote] = useState(note);

  const { setEditor } = useEditor();
  const titleInputRef = useRef(null);
  const clickTimeoutRef = useRef(null);
  const updateTimeoutRef = useRef(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current && !note.title) {
      if (titleInputRef.current) {
        titleInputRef.current.focus();
        isInitialMount.current = false;
      }
    }
  }, [note.title]);

  useEffect(() => {
    setLocalNote(note);
    setContent(cleanContent(note.content) || '');
    setTitle(note.title || '');
  }, [note]);

  const updateNote = async (updates) => {
    try {
      const updatedNote = {
        ...localNote,
        ...updates,
        title,
        order: note.order,
        type: note.type,
      };

      if (note.type === 'calendar' && !updates.views && localNote.views) {
        updatedNote.views = localNote.views;
      }

      const response = await fetch(`http://localhost:5001/api/notes/${note._id}`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedNote),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const savedNote = await response.json();
      setLocalNote(savedNote);
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

  const handleContentChange = (newContent) => {
    const sanitizedContent = sanitizeContent(newContent);
    setContent(sanitizedContent);

    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    updateTimeoutRef.current = setTimeout(() => {
      updateNote({ content: sanitizedContent });
    }, 500);
  };

  const handleEditorReady = (editor) => {
    editor.on('focus', () => {
      setEditor(editor);
      onEditorFocus?.();
    });
    editor.on('blur', () => {
      setEditor(null);
      onEditorBlur?.();
    });
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

  const updateExpansionState = async (expanded) => {
    try {
      const response = await fetch(`http://localhost:5001/api/notes/${note._id}`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...note,
          isExpanded: expanded
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error updating note expansion state:', error);
    }
  };

  const handleHeaderClick = (e) => {
    if (isEditingTitle) return;

    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
      setIsEditingTitle(true);
      setTimeout(() => {
        if (titleInputRef.current) {
          titleInputRef.current.focus();
        }
      }, 0);
      return;
    }

    clickTimeoutRef.current = setTimeout(() => {
      const newExpanded = !isExpanded;
      setIsExpanded(newExpanded);
      updateExpansionState(newExpanded);
      clickTimeoutRef.current = null;
    }, 200);
  };

  useEffect(() => {
    if (note.isExpanded !== undefined && note._id === localNote._id) {
      setIsExpanded(note.isExpanded);
    }
  }, [note.isExpanded, note._id, localNote._id]);

  const renderContent = () => {
    if (note.type === 'task') {
      return <TaskNote note={localNote} onUpdate={handleNoteUpdate} />;
    } else if (note.type === 'calendar') {
      return <CalendarNote note={localNote} onUpdate={handleNoteUpdate} />;
    }
    
    return (
      <RichTextEditor
        content={content}
        onChange={handleContentChange}
        onEditorReady={handleEditorReady}
        className="content-textarea"
        data-testid={`note-editor-${note.order}`}
      />
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
      className="note-wrapper"
      data-position={note.order}
      data-testid={`note-${note.order}`}
    >
      <div className={`note ${isExpanded ? 'expanded' : ''}`}>
        <div
          className={`note-header ${isEditingTitle ? 'editing' : ''}`}
          onClick={handleHeaderClick}
          data-testid={`note-header-${note.order}`}
          {...dragHandleProps}
        >
          {isEditingTitle ? (
            <input
              ref={titleInputRef}
              className="title-input"
              value={title}
              placeholder="Enter title..."
              onChange={handleTitleChange}
              onBlur={handleTitleBlur}
              onClick={(e) => e.stopPropagation()}
              data-testid={`note-title-input-${note.order}`}
            />
          ) : (
            <div
              className="title-display"
              data-testid={`note-title-display-${note.order}`}
            >
              {title || 'Untitled'}
            </div>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(note._id);
            }}
            className="delete-button"
            data-testid={`note-delete-${note.order}`}
          >
            ×
          </button>
        </div>
        
        {isExpanded && (
          <div className="note-content" data-testid={`note-content-${note.order}`}>
            {renderContent()}
          </div>
        )}
      </div>
    </div>
  );
};

export default Note;