import React from 'react';
import { Search, Filter, Heart, X } from 'lucide-react';

const Discover = ({ user }) => {
  return (
    <div className="discover">
      <div className="container">
        <div className="discover-header">
          <h1 className="page-title">
            <Search size={28} />
            Discover New People
          </h1>
          <p className="page-subtitle">
            Find potential matches based on your preferences and interests
          </p>
        </div>

        <div className="discover-filters card">
          <div className="filters-header">
            <Filter size={20} />
            <span>Filters</span>
          </div>
          <div className="filters-content">
            <div className="filter-group">
              <label>Age Range</label>
              <div className="age-range">
                <input type="range" min="18" max="65" defaultValue="25" />
                <span>18 - 65</span>
              </div>
            </div>
            <div className="filter-group">
              <label>Distance</label>
              <select>
                <option>Within 10 miles</option>
                <option>Within 25 miles</option>
                <option>Within 50 miles</option>
                <option>Anywhere</option>
              </select>
            </div>
          </div>
        </div>

        <div className="discover-content">
          <div className="cards-container">
            <div className="discover-card card">
              <div className="card-image">
                <div className="placeholder-image">
                  <Heart size={48} color="var(--text-light)" />
                </div>
                <div className="compatibility-score">92%</div>
              </div>
              <div className="card-info">
                <div className="card-header">
                  <h3>Sarah, 28</h3>
                  <div className="verified-badge">✓</div>
                </div>
                <p className="card-bio">
                  Love traveling, hiking, and trying new restaurants. Looking for someone to share adventures with!
                </p>
                <div className="card-interests">
                  <span className="interest-tag">Travel</span>
                  <span className="interest-tag">Hiking</span>
                  <span className="interest-tag">Food</span>
                </div>
              </div>
              <div className="card-actions">
                <button className="action-btn pass-btn">
                  <X size={24} />
                </button>
                <button className="action-btn like-btn">
                  <Heart size={24} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="discover-empty">
          <div className="empty-state">
            <Heart size={64} color="var(--text-light)" />
            <h3>No more profiles to show</h3>
            <p>Check back later for new potential matches!</p>
            <button className="btn btn-primary">
              Adjust Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Discover;