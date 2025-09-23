import React from 'react';
import { MessageCircle, Search, Send } from 'lucide-react';

const Messages = ({ user }) => {
  // Placeholder conversations data
  const conversations = [
    {
      id: 1,
      name: 'Emma',
      lastMessage: 'That sounds amazing! I\'d love to try that restaurant.',
      timestamp: '2 min ago',
      unreadCount: 2,
      isOnline: true
    },
    {
      id: 2,
      name: 'Sophie',
      lastMessage: 'Thanks for the recommendation!',
      timestamp: '1 hour ago',
      unreadCount: 0,
      isOnline: false
    }
  ];

  return (
    <div className="messages">
      <div className="container">
        <div className="messages-layout">
          {/* Conversations List */}
          <div className="conversations-panel">
            <div className="conversations-header">
              <h2>Conversations</h2>
              <div className="search-box">
                <Search size={16} />
                <input type="text" placeholder="Search conversations..." />
              </div>
            </div>
            
            <div className="conversations-list">
              {conversations.map((conversation) => (
                <div key={conversation.id} className="conversation-item">
                  <div className="conversation-avatar">
                    <div className="placeholder-avatar">
                      {conversation.name.charAt(0)}
                    </div>
                    {conversation.isOnline && <div className="online-dot"></div>}
                  </div>
                  
                  <div className="conversation-info">
                    <div className="conversation-header">
                      <h4>{conversation.name}</h4>
                      <span className="timestamp">{conversation.timestamp}</span>
                    </div>
                    <p className="last-message">{conversation.lastMessage}</p>
                  </div>
                  
                  {conversation.unreadCount > 0 && (
                    <div className="unread-badge">
                      {conversation.unreadCount}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Chat Area */}
          <div className="chat-panel">
            <div className="chat-header">
              <div className="chat-user-info">
                <div className="chat-avatar">E</div>
                <div>
                  <h3>Emma</h3>
                  <span className="status">Online now</span>
                </div>
              </div>
            </div>
            
            <div className="chat-messages">
              <div className="message received">
                <div className="message-content">
                  Hey! How's your day going?
                </div>
                <div className="message-time">2:30 PM</div>
              </div>
              
              <div className="message sent">
                <div className="message-content">
                  Great! Just finished a hiking trip. How about you?
                </div>
                <div className="message-time">2:35 PM</div>
              </div>
              
              <div className="message received">
                <div className="message-content">
                  That sounds amazing! I'd love to try that restaurant you mentioned.
                </div>
                <div className="message-time">2:38 PM</div>
              </div>
            </div>
            
            <div className="chat-input">
              <input 
                type="text" 
                placeholder="Type a message..." 
                className="message-input"
              />
              <button className="send-btn">
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>

        {conversations.length === 0 && (
          <div className="empty-state">
            <MessageCircle size={64} color="var(--text-light)" />
            <h3>No conversations yet</h3>
            <p>Start matching with people to begin conversations!</p>
            <button className="btn btn-primary">
              Find Matches
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;