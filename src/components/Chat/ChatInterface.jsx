import React, { useState, useEffect, useRef } from 'react';
import { FaTimes, FaPaperPlane, FaSmile, FaUsers } from 'react-icons/fa';

const ChatInterface = ({ target, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  
  // Sample messages for demo purposes
  useEffect(() => {
    // Generate sample messages based on target
    const sampleMessages = [
      {
        id: 1,
        sender: { id: 'system', name: 'System' },
        content: `Chat started with ${target.name}`,
        timestamp: new Date(Date.now() - 3600000)
      }
    ];
    
    if (target.type === 'team') {
      sampleMessages.push(
        {
          id: 2,
          sender: { id: 'user1', name: 'Jane Doe' },
          content: 'Good morning team! How is everyone doing?',
          timestamp: new Date(Date.now() - 1800000)
        },
        {
          id: 3,
          sender: { id: 'user2', name: 'John Smith' },
          content: 'Morning! Working on the dashboard UI today.',
          timestamp: new Date(Date.now() - 900000)
        }
      );
    } else {
      sampleMessages.push(
        {
          id: 2,
          sender: { id: 'user1', name: target.name },
          content: `Hi there! I received the task assignment.`,
          timestamp: new Date(Date.now() - 1800000)
        }
      );
    }
    
    setMessages(sampleMessages);
  }, [target]);
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    // Add new message to the chat
    const message = {
      id: Date.now(),
      sender: { id: 'current-user', name: 'You' },
      content: newMessage,
      timestamp: new Date()
    };
    
    setMessages([...messages, message]);
    setNewMessage('');
    
    // Simulate response
    setTimeout(() => {
      const response = {
        id: Date.now() + 1,
        sender: { 
          id: target.type === 'team' ? 'user3' : target.id, 
          name: target.type === 'team' ? 'Alex Johnson' : target.name 
        },
        content: `Thanks for your message! I'll get back to you soon.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, response]);
    }, 2000);
  };
  
  return (
    <div className="absolute bottom-16 right-0 w-80 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden flex flex-col" style={{ height: '400px' }}>
      {/* Chat Header */}
      <div className="bg-blue-600 text-white px-4 py-3 flex justify-between items-center">
        <h3 className="font-semibold flex items-center">
          {target.type === 'team' ? (
            <span className="flex items-center">
              <span className="h-6 w-6 rounded-full bg-white text-blue-600 flex items-center justify-center text-xs mr-2">
                <FaUsers />
              </span>
              Team Chat
            </span>
          ) : (
            <span className="flex items-center">
              <span className="h-6 w-6 rounded-full bg-white text-blue-600 flex items-center justify-center text-xs mr-2">
                {target.name.charAt(0).toUpperCase()}
              </span>
              {target.name}
            </span>
          )}
        </h3>
        <button onClick={onClose} className="text-white hover:text-gray-200">
          <FaTimes />
        </button>
      </div>
      
      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {messages.map(message => (
          <div 
            key={message.id} 
            className={`mb-3 ${message.sender.id === 'current-user' ? 'text-right' : 'text-left'}`}
          >
            {message.sender.id !== 'current-user' && message.sender.id !== 'system' && (
              <span className="text-xs text-gray-500">{message.sender.name}</span>
            )}
            <div 
              className={`inline-block rounded-lg px-3 py-2 max-w-[80%] break-words ${
                message.sender.id === 'system' 
                  ? 'bg-gray-200 text-gray-600 text-xs text-center w-full' 
                  : message.sender.id === 'current-user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-200'
              }`}
            >
              {message.content}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Chat Input */}
      <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-3 flex items-center">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border-0 focus:ring-0 outline-none text-sm"
        />
        <button
          type="button"
          className="text-gray-500 hover:text-gray-700 mr-2"
        >
          <FaSmile />
        </button>
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className={`rounded-full p-2 ${
            newMessage.trim() ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
          }`}
        >
          <FaPaperPlane className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;
