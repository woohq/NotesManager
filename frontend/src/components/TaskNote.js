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

  useEffect(() => {
    if (note.tasks && JSON.stringify(note.tasks) !== JSON.stringify(tasks)) {
      setTasks(note.tasks);
    }
  }, [note.tasks]);

  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
        updateBackend(tasks);
      }
    };
  }, [tasks]);

  return (
    <div className="task-note space-y-4">
      {tasks.map(task => (
        <div 
          key={task.id} 
          className={`task-item flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 group ${
            task.completed ? 'completed' : ''
          }`}
        >
          <input
            type="checkbox"
            checked={task.completed}
            onChange={(e) => updateTask(task.id, { completed: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
          />
          <input
            type="text"
            value={task.text}
            onChange={(e) => updateTask(task.id, { text: e.target.value })}
            className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-sm"
            placeholder="Enter task..."
          />
          <button
            onClick={() => deleteTask(task.id)}
            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
            type="button"
          >
            ×
          </button>
        </div>
      ))}
      
      <button 
        onClick={addTask} 
        className="w-full mt-4 p-2 text-gray-600 text-sm bg-gray-50 border border-dashed border-gray-300 rounded hover:bg-gray-100 hover:text-gray-700 transition-colors"
        type="button"
      >
        + Add Task
      </button>
    </div>
  );
};

export default TaskNote;