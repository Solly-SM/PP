import React, { useState, useEffect } from 'react';
import { User, Camera, Edit, Settings, MapPin, Briefcase, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { getUserProfile, updateUserProfile, uploadPhoto, deletePhoto } from '../services/users';

const Profile = ({ user, setUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    bio: user?.bio || '',
    location: {
      city: user?.location?.city || '',
      state: user?.location?.state || '',
      country: user?.location?.country || ''
    },
    lifestyle: {
      occupation: user?.lifestyle?.occupation || ''
    },
    interests: user?.interests || []
  });

  useEffect(() => {
    loadUserProfile();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadUserProfile = async () => {
    try {
      const profile = await getUserProfile();
      setUser(profile);
      setProfileData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        bio: profile.bio || '',
        location: {
          city: profile.location?.city || '',
          state: profile.location?.state || '',
          country: profile.location?.country || ''
        },
        lifestyle: {
          occupation: profile.lifestyle?.occupation || ''
        },
        interests: profile.interests || []
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setProfileData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const updatedUser = await updateUserProfile(profileData);
      setUser(updatedUser);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (event, isPrimary = false) => {
    const file = event.target.files[0];
    if (!file) return;

    // For now, we'll use a simple file reader to create a data URL
    // In a real app, you'd upload to a cloud service like Cloudinary
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const photoUrl = e.target.result;
        const updatedPhotos = await uploadPhoto(photoUrl, isPrimary);
        const updatedUser = { ...user, photos: updatedPhotos };
        setUser(updatedUser);
        toast.success('Photo uploaded successfully!');
      } catch (error) {
        toast.error(error.message);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeletePhoto = async (photoIndex) => {
    try {
      const updatedPhotos = await deletePhoto(photoIndex);
      const updatedUser = { ...user, photos: updatedPhotos };
      setUser(updatedUser);
      toast.success('Photo deleted successfully!');
    } catch (error) {
      toast.error(error.message);
    }
  };

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
              {/* Main photo slot */}
              <div className="photo-slot main-photo">
                {user.photos && user.photos.length > 0 && user.photos.find(p => p.isPrimary) ? (
                  <div className="photo-container">
                    <img 
                      src={user.photos.find(p => p.isPrimary).url} 
                      alt="Primary profile" 
                      className="photo-image"
                    />
                    <button 
                      className="photo-delete-btn"
                      onClick={() => handleDeletePhoto(user.photos.findIndex(p => p.isPrimary))}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="photo-upload-label">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(e, true)}
                      style={{ display: 'none' }}
                    />
                    <div className="placeholder-photo">
                      <Camera size={32} />
                      <span>Add Primary Photo</span>
                    </div>
                  </label>
                )}
              </div>
              
              {/* Additional photo slots */}
              {[...Array(5)].map((_, index) => {
                const photoIndex = user.photos ? user.photos.findIndex((p, i) => !p.isPrimary && i === index + 1) : -1;
                const hasPhoto = photoIndex !== -1;
                
                return (
                  <div key={index} className="photo-slot">
                    {hasPhoto ? (
                      <div className="photo-container">
                        <img 
                          src={user.photos[photoIndex].url} 
                          alt={`Profile ${index + 2}`} 
                          className="photo-image"
                        />
                        <button 
                          className="photo-delete-btn"
                          onClick={() => handleDeletePhoto(photoIndex)}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <label className="photo-upload-label">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handlePhotoUpload(e, false)}
                          style={{ display: 'none' }}
                        />
                        <div className="placeholder-photo">
                          <Camera size={24} />
                          <Upload size={16} />
                        </div>
                      </label>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Basic Info */}
          <div className="profile-info card">
            <h3>Basic Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Name</label>
                {isEditing ? (
                  <div className="name-inputs">
                    <input
                      type="text"
                      className="input"
                      placeholder="First Name"
                      value={profileData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                    />
                    <input
                      type="text"
                      className="input"
                      placeholder="Last Name"
                      value={profileData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                    />
                  </div>
                ) : (
                  <div className="info-value">
                    {user.firstName} {user.lastName}, {user.age}
                  </div>
                )}
              </div>
              
              <div className="info-item">
                <label>Location</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="input"
                    placeholder="City"
                    value={profileData.location.city}
                    onChange={(e) => handleInputChange('location.city', e.target.value)}
                  />
                ) : (
                  <div className="info-value">
                    <MapPin size={16} />
                    {user.location?.city || 'Add location'}
                  </div>
                )}
              </div>
              
              <div className="info-item">
                <label>Occupation</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="input"
                    placeholder="Occupation"
                    value={profileData.lifestyle.occupation}
                    onChange={(e) => handleInputChange('lifestyle.occupation', e.target.value)}
                  />
                ) : (
                  <div className="info-value">
                    <Briefcase size={16} />
                    {user.lifestyle?.occupation || 'Add occupation'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bio Section */}
          <div className="profile-bio card">
            <h3>About Me</h3>
            <div className="bio-content">
              {isEditing ? (
                <textarea 
                  className="bio-input input"
                  placeholder="Write something about yourself..."
                  rows={4}
                  value={profileData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                />
              ) : (
                user.bio ? (
                  <p>{user.bio}</p>
                ) : (
                  <p className="placeholder">Tell people about yourself...</p>
                )
              )}
            </div>
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
              <button 
                className="btn btn-primary btn-lg"
                onClick={handleSaveProfile}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button 
                className="btn btn-outline btn-lg"
                onClick={() => setIsEditing(false)}
                disabled={loading}
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