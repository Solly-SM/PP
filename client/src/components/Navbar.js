import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Heart, Home, Search, Users, MessageCircle, User, LogOut } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ user, onLogout }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/discover', icon: Search, label: 'Discover' },
    { path: '/matches', icon: Users, label: 'Matches' },
    { path: '/messages', icon: MessageCircle, label: 'Messages' },
    { path: '/profile', icon: User, label: 'Profile' }
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <Heart className="brand-icon" />
          <span className="brand-text">HeartConnect</span>
        </Link>
        
        <div className="navbar-nav">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={20} />
                <span className="nav-label">{item.label}</span>
              </Link>
            );
          })}
        </div>
        
        <div className="navbar-user">
          <div className="user-info">
            <div className="user-avatar">
              {user.photos && user.photos.length > 0 ? (
                <img src={user.photos[0].url} alt={user.firstName} />
              ) : (
                <div className="avatar-placeholder">
                  {user.firstName.charAt(0)}
                </div>
              )}
            </div>
            <span className="user-name">{user.firstName}</span>
          </div>
          
          <button onClick={onLogout} className="logout-btn">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;