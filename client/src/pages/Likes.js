import React, { useState, useEffect } from 'react';
import { ThumbsUp, Heart, Clock, Users } from 'lucide-react';

const Likes = ({ user }) => {
  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLikes();
  }, []);

  const fetchLikes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/matches/likes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch likes');
      }

      const data = await response.json();
      setLikes(data.likes || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLikeBack = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/matches/swipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: userId,
          action: 'like'
        })
      });

      if (response.ok) {
        // Remove from likes list and refresh
        setLikes(prev => prev.filter(like => like.otherUser._id !== userId));
      }
    } catch (err) {
      console.error('Error liking back:', err);
    }
  };

  const handlePass = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/matches/swipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: userId,
          action: 'pass'
        })
      });

      if (response.ok) {
        // Remove from likes list
        setLikes(prev => prev.filter(like => like.otherUser._id !== userId));
      }
    } catch (err) {
      console.error('Error passing:', err);
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const likedAt = new Date(timestamp);
    const diffInHours = Math.floor((now - likedAt) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return `${Math.floor(diffInDays / 7)}w ago`;
  };

  if (loading) {
    return (
      <div className="likes">
        <div className="container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading your likes...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="likes">
        <div className="container">
          <div className="error-state">
            <p>Error loading likes: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="likes">
      <div className="container">
        <div className="likes-header">
          <h1 className="page-title">
            <ThumbsUp size={28} />
            People Who Like You
          </h1>
          <p className="page-subtitle">
            {likes.length > 0 
              ? `${likes.length} ${likes.length === 1 ? 'person has' : 'people have'} liked you`
              : "No one has liked you yet"
            }
          </p>
        </div>

        {likes.length > 0 ? (
          <div className="likes-grid">
            {likes.map((like) => (
              <div key={like.id} className="like-card card card-hover">
                <div className="like-image">
                  {like.otherUser.photos && like.otherUser.photos.length > 0 ? (
                    <img 
                      src={like.otherUser.photos[0].url} 
                      alt={like.otherUser.firstName}
                      className="user-photo"
                    />
                  ) : (
                    <div className="placeholder-image">
                      <Heart size={32} color="var(--primary-color)" />
                    </div>
                  )}
                  <div className="online-indicator" style={{
                    background: like.otherUser.isOnline ? 'var(--success)' : 'var(--text-light)'
                  }}></div>
                  {like.action === 'super-like' && (
                    <div className="super-like-badge">
                      <Heart size={16} fill="currentColor" />
                      Super Like
                    </div>
                  )}
                </div>
                
                <div className="like-info">
                  <div className="like-header">
                    <h3>{like.otherUser.firstName}, {like.otherUser.age}</h3>
                    {like.compatibilityScore && (
                      <div className="compatibility">
                        {like.compatibilityScore}% match
                      </div>
                    )}
                  </div>
                  
                  <div className="like-details">
                    <div className="liked-time">
                      <Clock size={14} />
                      Liked you {formatTimeAgo(like.likedAt)}
                    </div>
                    
                    {like.otherUser.bio && (
                      <div className="user-bio">
                        {like.otherUser.bio.substring(0, 100)}
                        {like.otherUser.bio.length > 100 && '...'}
                      </div>
                    )}
                  </div>
                  
                  <div className="like-actions">
                    <button 
                      onClick={() => handlePass(like.otherUser._id)}
                      className="btn btn-outline btn-sm"
                    >
                      Pass
                    </button>
                    <button 
                      onClick={() => handleLikeBack(like.otherUser._id)}
                      className="btn btn-primary btn-sm"
                    >
                      <Heart size={16} />
                      Like Back
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <ThumbsUp size={64} color="var(--text-light)" />
            <h3>No likes yet</h3>
            <p>When someone likes you, they'll appear here!</p>
            <button className="btn btn-primary">
              <Users size={16} />
              Discover People
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Likes;