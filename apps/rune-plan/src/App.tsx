import React from 'react';

function App() {
  return (
    <div style={{
      padding: '20px',
      fontFamily: 'system-ui, sans-serif',
      background: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>
        🎯 Rune Plan
      </h1>
      
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h2>Visual Planning Client</h2>
        <p>Linear-style project management for Rune VCS</p>
        
        <div style={{ marginTop: '20px' }}>
          <h3>Features:</h3>
          <ul>
            <li>Project planning and task management</li>
            <li>Sprint planning and tracking</li>
            <li>Issue and story management</li>
            <li>Team collaboration tools</li>
          </ul>
        </div>
        
        <div style={{
          marginTop: '20px',
          padding: '10px',
          background: '#e3f2fd',
          borderRadius: '4px'
        }}>
          <strong>Status:</strong> Development mode - React app is running correctly!
        </div>
      </div>
    </div>
  );
}

export default App;
