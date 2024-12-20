import React from 'react';

const CalendarMonthView = ({ 
  selectedDate, 
  onDateSelect, 
  onContentUpdate,
  getContentForDate 
}) => {
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(selectedDate);
  const weeks = Math.ceil((daysInMonth + startingDayOfWeek) / 7);
  const selectedDayContent = getContentForDate(selectedDate);

  const handleWeekSelect = (weekNumber, firstDayOfWeek) => {
    // Create an array of 7 days starting from the first day of the week
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(firstDayOfWeek);
      date.setDate(firstDayOfWeek.getDate() + i);
      return date;
    });
    
    // Set selected date to the first day of the week
    onDateSelect(firstDayOfWeek);
  };

  const renderCalendarDays = () => {
    const days = [];
    let dayCount = 1;
    let currentWeek = 1;

    for (let i = 0; i < weeks; i++) {
      const weekDays = [];
      const firstDayOfWeek = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), dayCount - startingDayOfWeek);
      
      // Add week number as first column
      weekDays.push(
        <div 
          key={`week-${i}`} 
          onClick={() => handleWeekSelect(currentWeek, firstDayOfWeek)}
          className="flex items-center justify-center font-medium text-gray-500 hover:bg-gray-100 cursor-pointer h-14"
        >
          W{currentWeek}
        </div>
      );

      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < startingDayOfWeek) {
          weekDays.push(
            <div key={`empty-${j}`} className="p-2 border border-gray-200 h-14"></div>
          );
        } else if (dayCount <= daysInMonth) {
          const currentDate = new Date(
            selectedDate.getFullYear(),
            selectedDate.getMonth(),
            dayCount
          );
          const isSelected = 
            currentDate.getDate() === selectedDate.getDate() &&
            currentDate.getMonth() === selectedDate.getMonth() &&
            currentDate.getFullYear() === selectedDate.getFullYear();
          const hasContent = getContentForDate(currentDate).length > 0;

          weekDays.push(
            <div
              key={`day-${dayCount}`}
              onClick={() => onDateSelect(currentDate)}
              className={`border border-gray-200 cursor-pointer hover:bg-gray-50 h-14 ${
                isSelected ? 'bg-blue-50 border-blue-200' : ''
              }`}
            >
              <div className="flex flex-col h-full items-center justify-center relative">
                <span className={`${hasContent ? 'border-b-2 border-blue-400' : ''}`}>
                  {dayCount}
                </span>
              </div>
            </div>
          );
          dayCount++;
        } else {
          weekDays.push(
            <div key={`empty-end-${j}`} className="p-2 border border-gray-200 h-14"></div>
          );
        }
      }

      days.push(
        <div key={`week-row-${i}`} className="grid grid-cols-8 gap-0">
          {weekDays}
        </div>
      );
      currentWeek++;
    }

    return days;
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="calendar-grid">
        {/* Calendar header */}
        <div className="grid grid-cols-8 gap-0">
          <div className="h-10 flex items-center justify-center text-sm font-medium text-gray-500">W</div>
          {['Su', 'M', 'Tu', 'W', 'Th', 'F', 'Sa'].map(day => (
            <div key={day} className="h-10 flex items-center justify-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar body */}
        {renderCalendarDays()}
      </div>

      {/* Selected day content */}
      <div className="selected-day-content">
        <div className="mb-2 font-medium">
          {selectedDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
        <textarea
          value={selectedDayContent}
          onChange={(e) => onContentUpdate(selectedDate, e.target.value)}
          className="w-full h-[200px] p-2 border border-gray-200 rounded resize-none overflow-auto focus:outline-none"
          placeholder="Enter content for this day..."
        />
      </div>
    </div>
  );
};

export default CalendarMonthView;