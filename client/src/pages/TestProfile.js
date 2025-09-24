import React, { useState, useEffect } from 'react';
import { User, Camera, Edit, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { mockLogin } from '../services/mockAuth';
import { getUserProfile, updateUserProfile, uploadPhoto, deletePhoto } from '../services/mockUsers';

const TestProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    location: { city: '' },
    lifestyle: { occupation: '' }
  });

  useEffect(() => {
    loginAndLoadProfile();
  }, []);

  const loginAndLoadProfile = async () => {
    try {
      // Mock login
      await mockLogin();
      toast.success('Logged in successfully!');
      
      // Load profile
      const profile = await getUserProfile();
      setUser(profile);
      setProfileData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        bio: profile.bio || '',
        location: { city: profile.location?.city || '' },
        lifestyle: { occupation: profile.lifestyle?.occupation || '' }
      });
    } catch (error) {
      toast.error(error.message);
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

  if (!user) {
    return (
      <div className="profile">
        <div className="container">
          <div className="loading">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile">
      <div className="container">
        <div className="profile-header">
          <h1 className="page-title">
            <User size={28} />
            Test Profile (Mock Data)
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
          {/* Photos Section */}
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
                const photo = user.photos && user.photos.find((p, i) => !p.isPrimary && i === index + 1);
                
                return (
                  <div key={index} className="photo-slot">
                    {photo ? (
                      <div className="photo-container">
                        <img 
                          src={photo.url} 
                          alt={`Profile ${index + 2}`} 
                          className="photo-image"
                        />
                        <button 
                          className="photo-delete-btn"
                          onClick={() => handleDeletePhoto(user.photos.findIndex(p => p === photo))}
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

export default TestProfile;