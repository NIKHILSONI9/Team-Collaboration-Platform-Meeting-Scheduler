import React from 'react';

function GroupList({ groups, loading, error, onSelectGroup, onReload, selectedGroupId }) {
  if (error) {
    return (
      <div className="group-list">
        <div className="group-list-error">
          <p>Failed to load groups: {error}</p>
          <button className="reload-btn" onClick={onReload}>
            Reload Groups
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="group-list loading">
        <div className="loading-indicator">
          <div className="loading-spinner"></div>
          <p>Loading groups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="group-list">
      <div className="search-box">
        <input type="text" placeholder="Search groups..." />
      </div>
      
      <div className="my-groups">
        <h3>My Groups</h3>
        <ul>
          {groups.map(group => (
            <li 
              key={group.group_id} 
              onClick={() => onSelectGroup(group)}
              className={selectedGroupId === group.group_id ? 'selected' : ''}
            >
              {group.name}
              {selectedGroupId === group.group_id && (
                <span className="active-indicator">●</span>
              )}
            </li>
          ))}
        </ul>
      </div>
      
      <button className="add-group-btn">Add New Group</button>
    </div>
  );
}

export default GroupList;