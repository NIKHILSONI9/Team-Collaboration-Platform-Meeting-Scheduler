import React, { useState, useEffect, useRef } from 'react';
import ScheduleModal from './ScheduleModal';
import EmailConfirmation from './EmailConfirmation';

function ChatWindow({ group }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState(null);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [users, setUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState('u1');
  const messagesEndRef = useRef(null);

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const response = await fetch('http://localhost:5000/users');
        if (!response.ok) throw new Error('Failed to load users');
        
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(`User Error: ${err.message}`);
      } finally {
        setLoadingUsers(false);
      }
    };
    
    fetchUsers();
  }, []);

  // Fetch messages when group changes
  useEffect(() => {
    if (!group) return;
    
    const fetchMessages = async () => {
      try {
        setLoadingMessages(true);
        const response = await fetch(`http://localhost:5000/messages/${group.group_id}`);
        if (!response.ok) throw new Error('Failed to load messages');
        
        const data = await response.json();
        setMessages(data);
      } catch (err) {
        setError(`Message Error: ${err.message}`);
      } finally {
        setLoadingMessages(false);
      }
    };
    
    fetchMessages();
  }, [group]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !group) return;
    
    try {
      await fetch('http://localhost:5000/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: group.group_id,
          sender_id: currentUserId,
          content: newMessage
        })
      });
      
      // Refresh messages
      const response = await fetch(`http://localhost:5000/messages/${group.group_id}`);
      const newMessages = await response.json();
      setMessages(newMessages);
      setNewMessage('');
    } catch (err) {
      setError(`Send Error: ${err.message}`);
    }
  };

  const handleScheduleMeeting = async () => {
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: group.group_id })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Scheduling failed');
      }
      
      setShowModal(false);
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 3000);
    } catch (err) {
      setError(`Schedule Error: ${err.message}`);
    }
  };

  return (
    <div className="chat-window">
      {emailSent && <EmailConfirmation />}
      {error && <div className="error-message">{error}</div>}
      
      <div className="chat-header">
        <h2>{group.name}</h2>
        <button 
          className="schedule-btn"
          onClick={() => setShowModal(true)}
          disabled={messages.length === 0}
        >
          Schedule Meeting
        </button>
      </div>
      
      {/* User selector */}
      <div className="user-selector">
        <label>
          Send as:
          <select 
            value={currentUserId} 
            onChange={(e) => setCurrentUserId(e.target.value)}
            disabled={loadingUsers}
          >
            {loadingUsers ? (
              <option value="">Loading users...</option>
            ) : users.length > 0 ? (
              users.map(user => (
                <option key={user.user_id} value={user.user_id}>
                  {user.name} ({user.user_id})
                </option>
              ))
            ) : (
              <option value="">No users available</option>
            )}
          </select>
        </label>
      </div>
      
      <div className="message-list">
        {loadingMessages ? (
          <div className="loading-messages">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="empty-messages">
            <p>No messages yet. Start the conversation!</p>
            <p>Try discussing meeting times like:</p>
            <ul>
              <li>"Let's meet tomorrow at 3 PM"</li>
              <li>"How about Friday at 11 AM?"</li>
            </ul>
          </div>
        ) : (
          messages.map(msg => {
            const user = users.find(u => u.user_id === msg.sender_id);
            return (
              <div 
                key={`${msg.timestamp}-${msg.sender_id}`} 
                className={`message ${msg.sender_id === currentUserId ? 'user-message' : ''}`}
              >
                <div className="message-sender">
                  {user ? user.name : msg.sender_id}
                </div>
                <div className="message-content">{msg.content}</div>
                <div className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="message-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message"
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          disabled={!group}
        />
        <button 
          onClick={handleSendMessage}
          disabled={!newMessage.trim() || !group}
        >
          Send
        </button>
      </div>
      
      {showModal && (
        <ScheduleModal 
          group={group}
          onClose={() => setShowModal(false)}
          onConfirm={handleScheduleMeeting}
        />
      )}
    </div>
  );
}

export default ChatWindow;