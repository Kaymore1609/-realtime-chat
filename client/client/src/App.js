import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

// ✅ Backend URL
const socket = io('https://realtime-chat-server-ndom.onrender.com');
const username = 'Bokamoso';

function App() {
  const [messages, setMessages] = useState([]);
  const [privateMessages, setPrivateMessages] = useState({});
  const [input, setInput] = useState('');
  const [users, setUsers] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [typingStatus, setTypingStatus] = useState('');
  const typingTimeout = useRef(null);

  useEffect(() => {
    socket.emit('register', username);

    socket.on('chat message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('private message', ({ message, from }) => {
      setPrivateMessages((prev) => ({
        ...prev,
        [from]: [...(prev[from] || []), { from, message }],
      }));
    });

    socket.on('users', (users) => {
      setUsers(users);
    });

    socket.on('typing', (user) => {
      if (user !== username) setTypingStatus(`${user} is typing...`);
    });

    socket.on('stopTyping', () => {
      setTypingStatus('');
    });

    return () => {
      socket.off('chat message');
      socket.off('private message');
      socket.off('users');
      socket.off('typing');
      socket.off('stopTyping');
    };
  }, []);

  const handleInputChange = (e) => {
    setInput(e.target.value);
    socket.emit('typing', username);

    if (typingTimeout.current) clearTimeout(typingTimeout.current);

    typingTimeout.current = setTimeout(() => {
      socket.emit('stopTyping');
    }, 1000);
  };

  const sendMessage = () => {
    if (input.trim() === '') return;

    if (selectedUser) {
      socket.emit('private message', {
        to: selectedUser,
        from: username,
        message: input,
      });

      setPrivateMessages((prev) => ({
        ...prev,
        [selectedUser]: [...(prev[selectedUser] || []), { from: 'You', message: input }],
      }));
    } else {
      socket.emit('chat message', {
        username,
        message: input,
        timestamp: new Date().toISOString(),
      });
    }

    setInput('');
    socket.emit('stopTyping');
  };

  const renderMessages = () => {
    if (selectedUser) {
      const chats = privateMessages[selectedUser] || [];
      return chats.map((msg, idx) => (
        <div key={idx}>
          <strong>{msg.from}</strong>: {msg.message}
        </div>
      ));
    }

    return messages.map((msg, idx) => (
      <div key={idx}>
        <strong>{msg.username}</strong>: {msg.message}
        <div style={{ fontSize: '0.75rem', color: '#666' }}>
          {new Date(msg.timestamp).toLocaleTimeString()}
        </div>
      </div>
    ));
  };

  return (
    <div style={{ maxWidth: '1000px', margin: 'auto', padding: '1rem', display: 'flex' }}>
      {/* Sidebar */}
      <div style={{ width: '25%', marginRight: '1rem' }}>
        <h3>🟢 Online Users</h3>
        <ul>
          {Object.entries(users).map(([id, name]) =>
            id !== socket.id ? (
              <li key={id}>
                <button onClick={() => setSelectedUser(id)}>{name}</button>
              </li>
            ) : null
          )}
        </ul>
        <button onClick={() => setSelectedUser(null)} style={{ marginTop: '1rem' }}>
          🗨️ Global Chat
        </button>
      </div>

      {/* Chat Area */}
      <div style={{ width: '75%' }}>
        <h2>Welcome, {username}</h2>
        <img
          src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExejBhc3Q2ZHFyNnA1ZWNpeWdpbWE5M3dxODkxNmMyeDBmdDQwdWxpeSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/hVEBWRInEvNOEVS18i/giphy.gif"
          alt="welcome"
          style={{ width: '40%', maxWidth: '300px', display: 'block', margin: '1rem auto' }}
        />

        <div
          style={{
            border: '1px solid #ccc',
            borderRadius: '8px',
            padding: '1rem',
            height: '300px',
            overflowY: 'auto',
            background: '#f0f0f0',
          }}
        >
          {renderMessages()}
        </div>

        {typingStatus && (
          <div style={{ fontStyle: 'italic', color: '#777', marginTop: '5px' }}>
            {typingStatus}
          </div>
        )}

        <div style={{ marginTop: '1rem' }}>
          <input
            type="text"
            placeholder={selectedUser ? 'Send private message...' : 'Type your message...'}
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            style={{ width: '70%', padding: '0.5rem' }}
          />
          <button onClick={sendMessage} style={{ padding: '0.5rem 1rem', marginLeft: '1rem' }}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
