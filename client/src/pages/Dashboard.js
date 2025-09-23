import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Search, Users, MessageCircle, Star, TrendingUp } from 'lucide-react';

const Dashboard = ({ user }) => {
  const stats = [
    { icon: Heart, label: 'Profile Views', value: user.stats?.profileViews || 0, color: 'var(--primary-color)' },
    { icon: Users, label: 'Matches', value: user.stats?.matches || 0, color: 'var(--secondary-color)' },
    { icon: MessageCircle, label: 'Conversations', value: user.stats?.conversations || 0, color: 'var(--success)' },
    { icon: Star, label: 'Likes', value: user.stats?.likes || 0, color: 'var(--warning)' }
  ];

  const quickActions = [
    { to: '/discover', icon: Search, title: 'Discover People', description: 'Find new potential matches' },
    { to: '/matches', icon: Users, title: 'View Matches', description: 'See who you\'ve matched with' },
    { to: '/messages', icon: MessageCircle, title: 'Messages', description: 'Continue your conversations' },
    { to: '/profile', icon: Heart, title: 'Edit Profile', description: 'Update your profile information' }
  ];

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <div className="welcome-section">
            <h1 className="welcome-title">
              Welcome back, {user.firstName}! <Heart className="heart-icon" size={28} />
            </h1>
            <p className="welcome-subtitle">
              Ready to find your perfect match today?
            </p>
          </div>
          
          {user.isPremium && (
            <div className="premium-badge">
              <Star size={16} />
              <span>Premium Member</span>
            </div>
          )}
        </div>

        <div className="stats-grid">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="stat-card card">
                <div className="stat-icon" style={{ color: stat.color }}>
                  <Icon size={24} />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="quick-actions">
          <h2 className="section-title">Quick Actions</h2>
          <div className="actions-grid">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link key={index} to={action.to} className="action-card card card-hover">
                  <div className="action-icon">
                    <Icon size={24} />
                  </div>
                  <div className="action-content">
                    <h3 className="action-title">{action.title}</h3>
                    <p className="action-description">{action.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="dashboard-tips">
          <div className="tips-card card">
            <div className="tips-header">
              <TrendingUp className="tips-icon" />
              <h3>Tips to Improve Your Profile</h3>
            </div>
            <div className="tips-content">
              <ul className="tips-list">
                <li>Add more photos to showcase your personality</li>
                <li>Write a compelling bio that tells your story</li>
                <li>Update your interests to find better matches</li>
                <li>Be active and engage with your matches</li>
              </ul>
              <Link to="/profile" className="btn btn-primary">
                Update Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;