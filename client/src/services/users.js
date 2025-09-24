import api from './auth';

// User Profile API functions
export const getUserProfile = async (userId = null) => {
  try {
    const url = userId ? `/users/profile/${userId}` : '/users/profile';
    const response = await api.get(url);
    return response.data.user;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get user profile');
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    const response = await api.put('/users/profile', profileData);
    return response.data.user;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update profile');
  }
};

// Photo management functions
export const uploadPhoto = async (photoUrl, isPrimary = false) => {
  try {
    const response = await api.post('/users/photos', {
      url: photoUrl,
      isPrimary
    });
    return response.data.photos;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to upload photo');
  }
};

export const deletePhoto = async (photoIndex) => {
  try {
    const response = await api.delete(`/users/photos/${photoIndex}`);
    return response.data.photos;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete photo');
  }
};

// Discover users function
export const discoverUsers = async (page = 1, limit = 10) => {
  try {
    const response = await api.get(`/users/discover?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to discover users');
  }
};

// User statistics
export const getUserStats = async () => {
  try {
    const response = await api.get('/users/stats');
    return response.data.stats;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get user statistics');
  }
};

export default {
  getUserProfile,
  updateUserProfile,
  uploadPhoto,
  deletePhoto,
  discoverUsers,
  getUserStats
};