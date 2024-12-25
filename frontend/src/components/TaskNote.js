import React, { useState, useRef, useEffect } from 'react';

const TaskNote = ({ note, onUpdate }) => {
  const [tasks, setTasks] = useState(note.tasks || []);
  const updateTimeoutRef = useRef(null);

  const updateBackend = async (newTasks) => {
    try {
      const response = await fetch(`http://localhost:5001/api/notes/${note._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...note,
          tasks: newTasks,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error updating tasks:', error);
    }
  };

  const handleUpdate = (newTasks) => {
    setTasks(newTasks);
    
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    updateTimeoutRef.current = setTimeout(() => {
      updateBackend(newTasks);
    }, 500);
  };

  const addTask = () => {
    const newTasks = [
      ...tasks, 
      { 
        id: Date.now(), 
        text: '', 
        completed: false 
      }
    ];
    handleUpdate(newTasks);
  };

  const updateTask = (taskId, updates) => {
    const newTasks = tasks.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    );
    handleUpdate(newTasks);
  };

  const deleteTask = (taskId) => {
    const newTasks = tasks.filter(task => task.id !== taskId);
    handleUpdate(newTasks);
  };

  // Only update local state if the tasks array has actually changed
  useEffect(() => {
    if (note.tasks && JSON.stringify(note.tasks) !== JSON.stringify(tasks)) {
      setTasks(note.tasks);
    }
  }, [note.tasks]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
        updateBackend(tasks);
      }
    };
  }, [tasks]);

  return (
    <div className="task-note">
      {tasks.map(task => (
        <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
          <input
            type="checkbox"
            checked={task.completed}
            onChange={(e) => updateTask(task.id, { completed: e.target.checked })}
            className="task-checkbox"
          />
          <input
            type="text"
            value={task.text}
            onChange={(e) => updateTask(task.id, { text: e.target.value })}
            className="task-input"
            placeholder="Enter task..."
          />
          <button
            onClick={() => deleteTask(task.id)}
            className="task-delete"
            type="button"
          >
            ×
          </button>
        </div>
      ))}
      <button 
        onClick={addTask} 
        className="add-task"
        type="button"
      >
        + Add Task
      </button>
    </div>
  );
};

export default TaskNote;