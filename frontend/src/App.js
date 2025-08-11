import React, { useState, useEffect } from 'react';
import GroupList from './components/GroupList';
import ChatWindow from './components/ChatWindow';
import CalendarView from './components/CalendarView';
import './index.css';

function App() {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [view, setView] = useState('chat');
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Fetch groups from backend
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('http://localhost:5000/groups');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setGroups(data);
      } catch (err) {
        console.error('Error loading groups:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [reloadTrigger]);

  // Handle group selection
  const handleSelectGroup = (group) => {
    setSelectedGroup(group);
    // Reset to chat view when selecting a new group
    setView('chat');
  };

  // Handle meeting scheduled event (to refresh calendar view)
  const handleMeetingScheduled = () => {
    setReloadTrigger(prev => prev + 1);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>AI Meeting Scheduler</h1>
      </header>
      
      <div className="main-layout">
        <GroupList 
          groups={groups} 
          loading={loading}
          error={error}
          onSelectGroup={handleSelectGroup}
          onReload={() => setReloadTrigger(prev => prev + 1)}
          selectedGroupId={selectedGroup?.group_id}
        />
        
        <div className="content-area">
          {selectedGroup && (
            <div className="view-switcher">
              <button 
                onClick={() => setView('chat')} 
                className={view === 'chat' ? 'active' : ''}
              >
                Chat
              </button>
              <button 
                onClick={() => setView('calendar')} 
                className={view === 'calendar' ? 'active' : ''}
              >
                Calendar
              </button>
            </div>
          )}
          
          {selectedGroup ? (
            view === 'chat' ? (
              <ChatWindow 
                group={selectedGroup} 
                onMeetingScheduled={handleMeetingScheduled}
              />
            ) : (
              <CalendarView 
                groupId={selectedGroup.group_id} 
                key={selectedGroup.group_id + reloadTrigger}
              />
            )
          ) : (
            <div className="empty-state">
              <div className="welcome-content">
                <h2>Welcome to AI Meeting Scheduler</h2>
                <p className="welcome-description">
                  An intelligent system that analyzes your team conversations and automatically 
                  schedules meetings based on discussed times and participants.
                </p>
                
                <div className="feature-list">
                  <div className="feature">
                    <div className="feature-icon">💬</div>
                    <div className="feature-text">
                      <h3>Natural Language Processing</h3>
                      <p>Automatically detects meeting times mentioned in your chat conversations</p>
                    </div>
                  </div>
                  
                  <div className="feature">
                    <div className="feature-icon">📧</div>
                    <div className="feature-text">
                      <h3>Automatic Email Notifications</h3>
                      <p>Sends meeting invitations to all participants instantly</p>
                    </div>
                  </div>
                  
                  <div className="feature">
                    <div className="feature-icon">📅</div>
                    <div className="feature-text">
                      <h3>Integrated Calendar View</h3>
                      <p>See all scheduled meetings in a beautiful calendar interface</p>
                    </div>
                  </div>
                </div>
                
                <div className="getting-started">
                  <h3>Getting Started</h3>
                  <ol>
                    <li>Select a group from the left sidebar</li>
                    <li>Start a conversation about meeting times</li>
                    <li>Click "Schedule Meeting" to automatically create the event</li>
                    <li>Check your calendar view for all scheduled meetings</li>
                  </ol>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;