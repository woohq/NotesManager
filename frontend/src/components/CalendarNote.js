import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CalendarMonthView from './CalendarMonthView';
import CalendarWeekView from './CalendarWeekView';
import '../styles/CalendarNote.css';

const CalendarNote = ({ note, onUpdate }) => {
  // Convert string dates to Date objects when initializing from note data
  const [views, setViews] = useState(() => {
    if (note.views) {
      return note.views.map(view => ({
        ...view,
        selectedDate: new Date(view.selectedDate)
      }));
    }
    return [{
      id: 'view-1',
      viewType: note.viewType || 'month',
      selectedDate: new Date()
    }];
  });
  const [calendarData, setCalendarData] = useState(note.calendarData || []);

  const handleViewTypeChange = (viewId, newViewType) => {
    const updatedViews = views.map(view => 
      view.id === viewId ? { ...view, viewType: newViewType } : view
    );
    setViews(updatedViews);
    onUpdate({ 
      viewType: updatedViews[0].viewType,
      views: updatedViews.map(v => ({
        ...v,
        selectedDate: v.selectedDate.toISOString() // Convert date to string for storage
      }))
    });
  };

  useEffect(() => {
    // Convert stored date strings back to Date objects when note loads
    if (note.views) {
      setViews(note.views.map(view => ({
        ...view,
        selectedDate: new Date(view.selectedDate)
      })));
    }
  }, [note.views]);

  const handleDateSelect = (viewId, date) => {
    const updatedViews = views.map(view =>
      view.id === viewId ? { ...view, selectedDate: date } : view
    );
    setViews(updatedViews);
    onUpdate({ 
      views: updatedViews.map(v => ({
        ...v,
        selectedDate: v.selectedDate.toISOString()
      }))
    });
  };

  const handleContentUpdate = (date, content) => {
    const newData = [...calendarData];
    const existingEntryIndex = newData.findIndex(
      entry => entry.date === date.toISOString().split('T')[0]
    );

    if (existingEntryIndex !== -1) {
      newData[existingEntryIndex] = { 
        ...newData[existingEntryIndex], 
        content 
      };
    } else {
      newData.push({ 
        date: date.toISOString().split('T')[0], 
        content 
      });
    }

    setCalendarData(newData);
    onUpdate({ calendarData: newData });
  };

  const getContentForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const entry = calendarData.find(d => d.date === dateStr);
    return entry ? entry.content : '';
  };

  // Get the maximum order value
  const addNewView = () => {
    const lastView = views[views.length - 1];
    const newId = `view-${views.length + 1}`;
    const newViewType = lastView.viewType === 'month' ? 'week' : 'month';
    
    const updatedViews = [...views, {
      id: newId,
      viewType: newViewType,
      selectedDate: new Date(lastView.selectedDate)
    }];
    
    setViews(updatedViews);
    onUpdate({ 
      views: updatedViews.map(v => ({
        ...v,
        selectedDate: v.selectedDate.toISOString()
      }))
    });
  };

  const navigateNext = (viewId) => {
    const updatedViews = views.map(view => {
      if (view.id === viewId) {
        const newDate = new Date(view.selectedDate);
        if (view.viewType === 'month') {
          newDate.setMonth(newDate.getMonth() + 1);
        } else {
          newDate.setDate(newDate.getDate() + 7);
        }
        return { ...view, selectedDate: newDate };
      }
      return view;
    });
    setViews(updatedViews);
    onUpdate({ 
      views: updatedViews.map(v => ({
        ...v,
        selectedDate: v.selectedDate.toISOString()
      }))
    });
  };

  const navigatePrevious = (viewId) => {
    const updatedViews = views.map(view => {
      if (view.id === viewId) {
        const newDate = new Date(view.selectedDate);
        if (view.viewType === 'month') {
          newDate.setMonth(newDate.getMonth() - 1);
        } else {
          newDate.setDate(newDate.getDate() - 7);
        }
        return { ...view, selectedDate: newDate };
      }
      return view;
    });
    setViews(updatedViews);
    onUpdate({ 
      views: updatedViews.map(v => ({
        ...v,
        selectedDate: v.selectedDate.toISOString()
      }))
    });
  };

  const getCurrentPeriodLabel = (view) => {
    if (view.viewType === 'month') {
      return view.selectedDate.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      });
    } else {
      const weekStart = new Date(view.selectedDate);
      weekStart.setDate(view.selectedDate.getDate() - view.selectedDate.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      // Calculate week number
      const firstDayOfMonth = new Date(view.selectedDate.getFullYear(), view.selectedDate.getMonth(), 1);
      const firstWeekday = firstDayOfMonth.getDay();
      const weekNumber = Math.ceil((weekStart.getDate() + firstWeekday) / 7);
      
      return `W${weekNumber} < ${weekStart.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })} - ${weekEnd.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      })} >`;
    }
  };

  return (
    <div className="calendar-note">
      <div className="space-y-6">
        {views.map((view) => (
          <div key={view.id} className="calendar-view-container border rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex space-x-2">
                <button
                  className={`px-3 py-1 rounded ${
                    view.viewType === 'month' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700'
                  }`}
                  onClick={() => handleViewTypeChange(view.id, 'month')}
                >
                  Month
                </button>
                <button
                  className={`px-3 py-1 rounded ${
                    view.viewType === 'week' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700'
                  }`}
                  onClick={() => handleViewTypeChange(view.id, 'week')}
                >
                  Week
                </button>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigatePrevious(view.id)}
                  className="p-1 rounded hover:bg-gray-100"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="font-medium">
                  {getCurrentPeriodLabel(view)}
                </span>
                <button
                  onClick={() => navigateNext(view.id)}
                  className="p-1 rounded hover:bg-gray-100"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {view.viewType === 'month' ? (
              <CalendarMonthView
                selectedDate={view.selectedDate}
                onDateSelect={(date) => handleDateSelect(view.id, date)}
                onContentUpdate={handleContentUpdate}
                getContentForDate={getContentForDate}
              />
            ) : (
              <CalendarWeekView
                selectedDate={view.selectedDate}
                onDateSelect={(date) => handleDateSelect(view.id, date)}
                onContentUpdate={handleContentUpdate}
                getContentForDate={getContentForDate}
              />
            )}
          </div>
        ))}
      </div>
      
      <button 
        onClick={addNewView}
        className="w-full mt-4 p-2 text-gray-600 text-sm bg-gray-50 border border-dashed border-gray-300 rounded hover:bg-gray-100 hover:text-gray-700 transition-colors"
      >
        + Add Calendar View
      </button>
    </div>
  );
};

export default CalendarNote;