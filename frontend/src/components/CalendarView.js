import React, { useState, useEffect } from 'react';

function CalendarView({ groupId }) {
  const [meetings, setMeetings] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Debugging logs
  console.log(`[CalendarView] Rendering with groupId: ${groupId}, currentDate: ${currentDate.toISOString()}`);

  // Fetch meetings when groupId or currentDate changes
  useEffect(() => {
    if (!groupId) {
      console.log("[CalendarView] No groupId provided, skipping fetch");
      setMeetings([]);
      setLoading(false);
      return;
    }

    const fetchMeetings = async () => {
      console.log(`[CalendarView] Fetching meetings for group: ${groupId}`);
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`http://localhost:5000/meetings/${groupId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`[CalendarView] Received ${data.length} meetings for group ${groupId}`);
        setMeetings(data);
      } catch (err) {
        console.error("[CalendarView] Error fetching meetings:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, [groupId, currentDate]);

  // Navigation between months
  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  // Generate calendar days with meetings - improved date handling
  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days = [];
    
    // Add empty cells for days before first day
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    
    // Add actual days with meetings
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const dayDate = new Date(year, month, i);
      
      // Find meetings for this specific day
      const dayMeetings = meetings.filter(m => {
        if (!m.scheduled_time) return false;
        
        try {
          const meetingDate = new Date(m.scheduled_time);
          return (
            meetingDate.getFullYear() === year &&
            meetingDate.getMonth() === month &&
            meetingDate.getDate() === i
          );
        } catch (e) {
          console.error(`[CalendarView] Error parsing date for meeting: ${m.scheduled_time}`, e);
          return false;
        }
      });
      
      days.push({ 
        date: dayDate,
        day: i, 
        meetings: dayMeetings 
      });
    }
    
    return days;
  };

  const days = getCalendarDays();
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  // Format time for display
  const formatTime = (dateString) => {
    try {
      return new Date(dateString).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    } catch (e) {
      console.error(`[CalendarView] Error formatting time: ${dateString}`, e);
      return 'Invalid time';
    }
  };

  // Check if date is today
  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="calendar-view">
      <div className="calendar-header">
        <div className="calendar-navigation">
          <button 
            className="nav-btn prev-btn"
            onClick={() => navigateMonth(-1)}
            aria-label="Previous month"
          >
            &lt;
          </button>
          <h2>{monthName} {year}</h2>
          <button 
            className="nav-btn next-btn"
            onClick={() => navigateMonth(1)}
            aria-label="Next month"
          >
            &gt;
          </button>
        </div>
      </div>
      
      {error && (
        <div className="calendar-error">
          <div className="error-icon">⚠️</div>
          <div className="error-text">Error loading meetings: {error}</div>
          <button className="retry-btn" onClick={() => setCurrentDate(new Date())}>
            Retry
          </button>
        </div>
      )}
      
      {loading ? (
        <div className="calendar-loading">
          <div className="loading-spinner"></div>
          <p>Loading meetings...</p>
        </div>
      ) : (
        <>
          <div className="calendar-grid">
            {weekdays.map(day => (
              <div key={day} className="calendar-weekday">{day}</div>
            ))}
            
            {days.map((dayInfo, index) => (
              <div 
                key={index} 
                className={`calendar-day ${!dayInfo ? 'empty-day' : ''} ${dayInfo && isToday(dayInfo.date) ? 'today' : ''}`}
              >
                {dayInfo ? (
                  <>
                    <div className="day-number">{dayInfo.day}</div>
                    <div className="meetings-container">
                      {dayInfo.meetings.length > 0 ? (
                        dayInfo.meetings.map((meeting, idx) => (
                          <div 
                            key={`${meeting.chat_id}-${meeting.scheduled_time}-${idx}`} 
                            className="meeting-event"
                            title={`${meeting.title || 'Meeting'}\nTime: ${formatTime(meeting.scheduled_time)}\nParticipants: ${meeting.participants?.join(', ') || 'none'}`}
                          >
                            <div className="event-time">
                              {formatTime(meeting.scheduled_time)}
                            </div>
                            <div className="event-title">
                              {meeting.title || 'Team Meeting'}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="no-meetings">No meetings</div>
                      )}
                    </div>
                  </>
                ) : null}
              </div>
            ))}
          </div>
          
          {meetings.length === 0 && !error && (
            <div className="empty-calendar">
              <div className="empty-icon">📅</div>
              <h3>No Scheduled Meetings</h3>
              <p>Schedule a meeting through the chat to see it appear here</p>
              <button 
                className="goto-chat-btn"
                onClick={() => window.scrollTo(0, 0)}
              >
                Go to Chat
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default CalendarView;