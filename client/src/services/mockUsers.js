import api from './mockAuth';

// Mock User Profile API functions
export const getUserProfile = async (userId = null) => {
  try {
    const url = userId ? `/mock-users/profile/${userId}` : '/mock-users/profile';
    const response = await api.get(url);
    return response.data.user;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get user profile');
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    const response = await api.put('/mock-users/profile', profileData);
    return response.data.user;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update profile');
  }
};

// Photo management functions
export const uploadPhoto = async (photoUrl, isPrimary = false) => {
  try {
    const response = await api.post('/mock-users/photos', {
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
    const response = await api.delete(`/mock-users/photos/${photoIndex}`);
    return response.data.photos;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete photo');
  }
};

const mockUsersService = {
  getUserProfile,
  updateUserProfile,
  uploadPhoto,
  deletePhoto
};

export default mockUsersService;