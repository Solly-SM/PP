import React from 'react';
import { Users, Heart, MessageCircle, Calendar } from 'lucide-react';

const Matches = ({ user }) => {
  // Placeholder matches data
  const matches = [
    {
      id: 1,
      name: 'Emma',
      age: 26,
      compatibilityScore: 95,
      isOnline: true,
      lastMessage: 'Hey! How\'s your day going?',
      matchedAt: '2 days ago'
    },
    {
      id: 2,
      name: 'Sophie',
      age: 24,
      compatibilityScore: 89,
      isOnline: false,
      lastMessage: null,
      matchedAt: '1 week ago'
    }
  ];

  return (
    <div className="matches">
      <div className="container">
        <div className="matches-header">
          <h1 className="page-title">
            <Users size={28} />
            Your Matches
          </h1>
          <p className="page-subtitle">
            You have {matches.length} matches waiting for you
          </p>
        </div>

        <div className="matches-grid">
          {matches.map((match) => (
            <div key={match.id} className="match-card card card-hover">
              <div className="match-image">
                <div className="placeholder-image">
                  <Heart size={32} color="var(--primary-color)" />
                </div>
                <div className="online-indicator" style={{
                  background: match.isOnline ? 'var(--success)' : 'var(--text-light)'
                }}></div>
              </div>
              
              <div className="match-info">
                <div className="match-header">
                  <h3>{match.name}, {match.age}</h3>
                  <div className="compatibility">
                    {match.compatibilityScore}% match
                  </div>
                </div>
                
                <div className="match-details">
                  <div className="matched-date">
                    <Calendar size={14} />
                    Matched {match.matchedAt}
                  </div>
                  
                  {match.lastMessage && (
                    <div className="last-message">
                      <MessageCircle size={14} />
                      {match.lastMessage}
                    </div>
                  )}
                </div>
                
                <div className="match-actions">
                  <button className="btn btn-outline btn-sm">
                    View Profile
                  </button>
                  <button className="btn btn-primary btn-sm">
                    <MessageCircle size={16} />
                    Message
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {matches.length === 0 && (
          <div className="empty-state">
            <Users size={64} color="var(--text-light)" />
            <h3>No matches yet</h3>
            <p>Start swiping to find your perfect match!</p>
            <button className="btn btn-primary">
              Discover People
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Matches;