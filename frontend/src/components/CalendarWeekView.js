import React, { useState } from 'react';

const CalendarWeekView = ({ 
  selectedDate, 
  onDateSelect, 
  onContentUpdate,
  getContentForDate 
}) => {
  const [expandedDate, setExpandedDate] = useState(null);

  // Get the dates for the current week
  const getWeekDates = (date) => {
    const currentDay = date.getDay(); // 0-6
    const weekDates = [];
    
    // Get Sunday of the current week
    const sunday = new Date(date);
    sunday.setDate(date.getDate() - currentDay);

    // Generate array of dates for the week
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(sunday);
      currentDate.setDate(sunday.getDate() + i);
      weekDates.push(currentDate);
    }

    return weekDates;
  };

  const getWeekNumber = (date) => {
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const firstWeekday = firstDayOfMonth.getDay();
    return Math.ceil((date.getDate() + firstWeekday) / 7);
  };

  const weekDates = getWeekDates(selectedDate);
  const weekNumber = getWeekNumber(selectedDate);

  const handleDateClick = (date) => {
    if (expandedDate?.getTime() === date.getTime()) {
      setExpandedDate(null);
    } else {
      onDateSelect(date);
      setExpandedDate(date);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Week grid */}
      <div className="grid grid-cols-7 gap-2">
        {weekDates.map((date) => {
          const isExpanded = expandedDate?.getTime() === date.getTime();
          const dayContent = getContentForDate(date);

          return (
            <div 
              key={date.toISOString()}
              className="week-view-day bg-white transition-all"
            >
              {/* Day header */}
              <div className={`p-2 text-center border-b border-gray-100
                ${isExpanded ? 'bg-blue-50' : ''}`}
              >
                <div className="text-xs font-medium text-gray-500">
                  {['Su', 'M', 'Tu', 'W', 'Th', 'F', 'Sa'][date.getDay()]}
                </div>
                <div className="text-sm font-medium">
                  {date.getDate()}
                </div>
              </div>

              {/* Day content preview */}
              <div
                onClick={() => handleDateClick(date)}
                className={`p-2 h-20 text-[9px] leading-tight overflow-auto cursor-pointer hover:bg-gray-50 ${
                  isExpanded ? 'bg-[#f9fafb]' : ''
                }`}
              >
                {dayContent}
              </div>
            </div>
          );
        })}
      </div>

      {/* Expanded content pane */}
      {expandedDate && (
        <div className="mt-2 p-4 border border-gray-200 rounded-md bg-white">
          <div className="mb-2 text-sm font-medium">
            {expandedDate.toLocaleDateString('en-US', { 
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
          <textarea
            value={getContentForDate(expandedDate)}
            onChange={(e) => onContentUpdate(expandedDate, e.target.value)}
            className="w-full h-[150px] p-2 text-sm border border-gray-200 rounded resize-none focus:outline-none"
            placeholder="Enter content for this day..."
          />
        </div>
      )}
    </div>
  );
};

export default CalendarWeekView;