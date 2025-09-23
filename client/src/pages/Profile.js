import React, { useState } from 'react';
import { User, Camera, Edit, Settings, Heart, MapPin, Briefcase } from 'lucide-react';

const Profile = ({ user, setUser }) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="profile">
      <div className="container">
        <div className="profile-header">
          <h1 className="page-title">
            <User size={28} />
            My Profile
          </h1>
          <button 
            className="btn btn-outline"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit size={16} />
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        <div className="profile-content">
          {/* Profile Picture Section */}
          <div className="profile-photos card">
            <h3>Photos</h3>
            <div className="photos-grid">
              <div className="photo-slot main-photo">
                <div className="placeholder-photo">
                  <Camera size={32} />
                  <span>Add Photo</span>
                </div>
              </div>
              {[...Array(5)].map((_, index) => (
                <div key={index} className="photo-slot">
                  <div className="placeholder-photo">
                    <Camera size={24} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Basic Info */}
          <div className="profile-info card">
            <h3>Basic Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Name</label>
                <div className="info-value">
                  {user.firstName} {user.lastName}, {user.age}
                </div>
              </div>
              
              <div className="info-item">
                <label>Location</label>
                <div className="info-value">
                  <MapPin size={16} />
                  {user.location?.city || 'Add location'}
                </div>
              </div>
              
              <div className="info-item">
                <label>Occupation</label>
                <div className="info-value">
                  <Briefcase size={16} />
                  {user.lifestyle?.occupation || 'Add occupation'}
                </div>
              </div>
            </div>
          </div>

          {/* Bio Section */}
          <div className="profile-bio card">
            <h3>About Me</h3>
            <div className="bio-content">
              {user.bio ? (
                <p>{user.bio}</p>
              ) : (
                <p className="placeholder">Tell people about yourself...</p>
              )}
            </div>
            {isEditing && (
              <textarea 
                className="bio-input input"
                placeholder="Write something about yourself..."
                rows={4}
                defaultValue={user.bio}
              />
            )}
          </div>

          {/* Interests Section */}
          <div className="profile-interests card">
            <h3>Interests</h3>
            <div className="interests-list">
              {user.interests && user.interests.length > 0 ? (
                user.interests.map((interest, index) => (
                  <span key={index} className="interest-tag">
                    {interest.name}
                  </span>
                ))
              ) : (
                <p className="placeholder">Add your interests to help find better matches</p>
              )}
            </div>
          </div>

          {/* Preferences Section */}
          <div className="profile-preferences card">
            <h3>Preferences</h3>
            <div className="preferences-grid">
              <div className="preference-item">
                <label>Age Range</label>
                <div className="preference-value">
                  {user.preferences?.ageRange?.min || 22} - {user.preferences?.ageRange?.max || 35}
                </div>
              </div>
              
              <div className="preference-item">
                <label>Distance</label>
                <div className="preference-value">
                  Within {user.preferences?.maxDistance || 50} miles
                </div>
              </div>
              
              <div className="preference-item">
                <label>Looking for</label>
                <div className="preference-value">
                  {user.interestedIn?.join(', ') || 'Not specified'}
                </div>
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="profile-settings card">
            <h3>
              <Settings size={20} />
              Account Settings
            </h3>
            <div className="settings-list">
              <div className="setting-item">
                <span>Email</span>
                <span>{user.email}</span>
              </div>
              
              <div className="setting-item">
                <span>Verification Status</span>
                <span className={`status ${user.isVerified ? 'verified' : 'unverified'}`}>
                  {user.isVerified ? 'Verified ✓' : 'Not Verified'}
                </span>
              </div>
              
              <div className="setting-item">
                <span>Privacy Settings</span>
                <button className="btn btn-sm btn-outline">
                  Manage
                </button>
              </div>
              
              <div className="setting-item">
                <span>Account Status</span>
                <span className={`status ${user.isPremium ? 'premium' : 'free'}`}>
                  {user.isPremium ? 'Premium' : 'Free'}
                </span>
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="profile-actions">
              <button className="btn btn-primary btn-lg">
                Save Changes
              </button>
              <button 
                className="btn btn-outline btn-lg"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;