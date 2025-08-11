import React, { useState, useEffect } from 'react';

function ScheduleModal({ group, onClose, onConfirm }) {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [suggestedTime, setSuggestedTime] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);

  // Fetch participants and suggest meeting time
  useEffect(() => {
    if (!group) return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch messages to determine participants
        const messagesRes = await fetch(`http://localhost:5000/messages/${group.group_id}`);
        if (!messagesRes.ok) throw new Error('Failed to load chat history');
        
        const messages = await messagesRes.json();
        
        // Extract unique participants
        const uniqueSenders = [...new Set(messages.map(msg => msg.sender_id))];
        setParticipants(uniqueSenders);
        
        // Analyze messages to suggest a meeting time
        const timeSuggestions = extractTimeSuggestions(messages);
        setSuggestedTime(timeSuggestions.length > 0 ? timeSuggestions[0] : '');
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [group]);

  // Simple time extraction for frontend suggestion
  const extractTimeSuggestions = (messages) => {
    const timePattern = /\b(\d{1,2}(?::\d{2})?\s?[AP]M)\b/gi;
    const dayPattern = /\b(mon|tues|wednes|thurs|fri|satur|sun|today|tomorrow)\b/gi;
    
    const suggestions = [];
    
    // Scan messages for time references
    messages.forEach(msg => {
      const timeMatches = msg.content.match(timePattern);
      const dayMatches = msg.content.match(dayPattern);
      
      if (timeMatches) {
        let time = timeMatches[0];
        if (dayMatches) {
          time = `${dayMatches[0]} at ${time}`;
        }
        suggestions.push(time);
      }
    });
    
    return suggestions;
  };

  // Format suggested time nicely
  const formatSuggestedTime = () => {
    if (!suggestedTime) return 'No time detected in chat';
    
    // Try to parse the time
    try {
      const date = new Date();
      const [timePart] = suggestedTime.split(' at ');
      
      // Simple time formatting
      return suggestedTime.charAt(0).toUpperCase() + suggestedTime.slice(1);
    } catch {
      return suggestedTime;
    }
  };

  const handleConfirm = async () => {
    try {
      setIsScheduling(true);
      setError(null);
      await onConfirm();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsScheduling(false);
    }
  };

  if (loading) {
    return (
      <div className="modal-backdrop">
        <div className="modal">
          <h2>Analyzing Conversation</h2>
          <div className="loading-indicator">
            <div className="spinner"></div>
            <p>Scanning messages for participants and meeting times...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Schedule Meeting for {group.name}</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-group">
          <label>Suggested Time</label>
          <div className="time-suggestion">
            {formatSuggestedTime()}
            <div className="time-note">
              Actual time will be determined by AI analysis of your conversation
            </div>
          </div>
        </div>
        
        <div className="form-group">
          <label>Participants</label>
          <div className="participants-container">
            {participants.length > 0 ? (
              <div className="participants-list">
                {participants.map(p => (
                  <div key={p} className="participant-tag">
                    <span className="participant-badge">👤</span>
                    {p}
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-participants">
                No participants found in conversation
              </div>
            )}
            <div className="participant-note">
              All group members who participated in the conversation will be included
            </div>
          </div>
        </div>
        
        <div className="modal-actions">
          <button 
            className="cancel-btn" 
            onClick={onClose}
            disabled={isScheduling}
          >
            Cancel
          </button>
          <button 
            className="confirm-btn" 
            onClick={handleConfirm}
            disabled={isScheduling || participants.length === 0}
          >
            {isScheduling ? (
              <span className="scheduling-text">Scheduling...</span>
            ) : (
              'Confirm Schedule'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ScheduleModal;