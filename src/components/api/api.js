// src/api/api.js
import axios from 'axios';

const API = axios.create({ baseURL: process.env.REACT_APP_API_URL });
// const API = axios.create({
//   baseURL: process.env.REACT_APP_API_URL,
//   withCredentials: true
// });

// Function to check and refresh the token
const refreshAuthToken = async () => {
  const authToken = localStorage.getItem('authToken');
  if (authToken) {
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/refresh-token`,
        {},
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      const newToken = data.authToken;

      // Update tokens in localStorage
      const tokens = JSON.parse(localStorage.getItem('authTokens')) || {};
      const tokenUsername = localStorage.getItem('tokenUsername');
      tokens[tokenUsername] = newToken;
      localStorage.setItem('authTokens', JSON.stringify(tokens));
      localStorage.setItem('authToken', newToken);
    } catch (error) {
      console.error('Error refreshing token:', error);
      // If token refresh fails, log the user out
      localStorage.removeItem('authToken');
      localStorage.removeItem('authTokens');
      localStorage.removeItem('tokenUsername');
      localStorage.removeItem('userId');
      localStorage.removeItem('currentPage');
      window.location.reload();
    }
  }
};

// Add interceptors to refresh token if expired
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      await refreshAuthToken();
      const newAuthToken = localStorage.getItem('authToken');
      if (newAuthToken) {
        originalRequest.headers['Authorization'] = `Bearer ${newAuthToken}`;
        return API(originalRequest);
      }
    }
    return Promise.reject(error);
  }
);

// Add activity listener to refresh tokens proactively
let activityTimeout;
const extendSession = () => {
  clearTimeout(activityTimeout);
  activityTimeout = setTimeout(refreshAuthToken, 10 * 60 * 1000); // 10 minutes
};
['mousemove', 'keydown', 'scroll', 'click'].forEach((event) =>
  window.addEventListener(event, extendSession)
);

export default API;

export const addUserPost = (data) => {
  const authToken = localStorage.getItem('authToken');
  const headers = {
    'Content-Type': 'multipart/form-data',
    Authorization: `Bearer ${authToken}`,
  };
  return API.post('/api/posts/add', data, { headers });
};

export const updateUserPost = (id, data) => {
  const authToken = localStorage.getItem('authToken');
  const headers = {
    'Content-Type': 'multipart/form-data',
    Authorization: `Bearer ${authToken}`,
  };
  return API.put(`/api/posts/${id}`, data, { headers });
};

export const deleteUserPost = (id) => {
  const authToken = localStorage.getItem('authToken');
  const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
  return API.delete(`/api/posts/${id}`, { headers });
};

// Fetch user's own posts
export const fetchUserPosts0 = () => {
  const authToken = localStorage.getItem('authToken');
  const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
  return API.get('/api/posts/my-posts', { headers });
};

export const fetchUserPosts = (skip = 0, limit = 12, filters = {} ) => {
  const params = { skip, limit,
    // categories: filters.categories,
    // serviceType: filters.serviceType,
    // gender: filters.gender,
    postStatus: filters.postStatus,
    // price: `${filters.priceRange[0]}-${filters.priceRange[1]}`,
    postType: filters.postType, // added this line for only shows the Helper posts on ALL section
    // sortBy: sortBy
  };

  const authToken = localStorage.getItem('authToken');
  const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
  
  return API.get('/api/posts/my-posts', { headers, params });
};

// Fetch blood donors
export const fetchBloodDonors = (skip = 0, limit = 12, userLocation = null, distanceRange = null, filters = {}, searchQuery = '', sortBy = 'nearest') => {
  const params = { 
    skip, 
    limit,
    bloodGroup: filters.bloodGroup || 'All',
    sortBy
  };

  // Add search query parameter
  if (searchQuery && searchQuery.trim()) {
    params.search = searchQuery.trim();
  }
  
  // Add location parameters if provided
  if (userLocation && distanceRange) {
    params.userLat = userLocation.latitude;
    params.userLng = userLocation.longitude;
    params.distance = distanceRange;
  }

  const authToken = localStorage.getItem('authToken');
  const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
  
  return API.get('/api/posts/blood-donors', { headers, params });
};

// Fetch blood donor locations
export const fetchBloodDonorLocations = (userLocation, distanceRange, filters = {}, searchQuery = '') => {
  const params = {
    userLat: userLocation.latitude,
    userLng: userLocation.longitude,
    distance: distanceRange,
    bloodGroup: filters.bloodGroup || 'All'
  };

  if (searchQuery && searchQuery.trim()) {
    params.search = searchQuery.trim();
  }

  const authToken = localStorage.getItem('authToken');
  const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};

  return API.get('/api/posts/blood-donors/locations', { headers, params });
};

// export const fetchPosts = () => API.get('/api/posts');
export const fetchPosts = (skip = 0, limit = 12, userLocation = null, distanceRange = null, filters = {}, searchQuery = '', sortBy = 'nearest') => {
  const params = { skip, limit,
    categories: filters.categories,
    serviceType: filters.serviceType,
    gender: filters.gender,
    postStatus: filters.postStatus,
    price: `${filters.priceRange[0]}-${filters.priceRange[1]}`,
    postType: filters.serviceType ? 'ServiceOffering' : 'HelpRequest', // added this line for only shows the Helper posts on ALL section
    sortBy: sortBy
  };

  // Add search query parameter
  if (searchQuery && searchQuery.trim()) {
    params.search = searchQuery.trim();
  }
  
  // Add location parameters if provided
  if (userLocation && distanceRange) {
    params.userLat = userLocation.latitude;
    params.userLng = userLocation.longitude;
    params.distance = distanceRange;
  }

  const authToken = localStorage.getItem('authToken');
  const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
  
  return API.get('/api/posts', { headers, params });
};

// all posts locations data
export const fetchPostLocations = (userLocation, distanceRange, filters = {}, searchQuery = '') => {
  const params = {
    userLat: userLocation.latitude,
    userLng: userLocation.longitude,
    distance: distanceRange,
    categories: filters.categories,
    serviceType: filters.serviceType,
    gender: filters.gender,
    postStatus: filters.postStatus,
    price: `${filters.priceRange[0]}-${filters.priceRange[1]}`,
    postType: filters.serviceType ? 'ServiceOffering' : 'HelpRequest',
  };

  if (searchQuery && searchQuery.trim()) {
    params.search = searchQuery.trim();
  }

  const authToken = localStorage.getItem('authToken');
  const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};

  return API.get('/api/posts/locations', { headers, params });
};

export const fetchPostById = async (id) => {
  const authToken = localStorage.getItem('authToken');
  const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};

  return await API.get(`/api/posts/${id}`, { headers });
};

export const fetchPostMediaById = async (postId) => {
  const authToken = localStorage.getItem('authToken');
  const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};

  return await API.get(`/api/posts/postMedia/${postId}`, { headers });
};

export const fetchWishlist = async () => {
  const authToken = localStorage.getItem('authToken');
  return await API.get('/api/wishlist', {
      headers: {
          Authorization: `Bearer ${authToken}`,
      },
  });
};

export const checkPostInWishlist = async (postId) => {
  const authToken = localStorage.getItem('authToken');
  const response = await API.get(`/api/wishlist/is-in-wishlist/${postId}`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
  return response.data.isInWishlist;
};


export const addToWishlist = async (postId) => {
    const authToken = localStorage.getItem('authToken');
    return await API.post('/api/wishlist/add', { postId }, {
        headers: {
            Authorization: `Bearer ${authToken}`,
        },
    });
};

export const removeFromWishlist = async (postId) => {
    const authToken = localStorage.getItem('authToken');
    return await API.post('/api/wishlist/remove', { postId }, {
        headers: {
            Authorization: `Bearer ${authToken}`,
        },
    });
};

export const likePost = async (id) => {
  const authToken = localStorage.getItem('authToken');
  const response = await API.post(`/api/likes/${id}/like`, {}, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  return response.data;
};
export const checkIfLiked = async (id) => {
  const authToken = localStorage.getItem('authToken');
  const response = await API.get(`/api/likes/${id}/isLiked`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  return response.data.isLiked;
};
export const fetchLikesCount = async (id) => {
  const response = await API.get(`/api/likes/${id}/count`);
  return response.data.likes;
};

export const addComment = async (id, comment) => {
  const authToken = localStorage.getItem('authToken');
  const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};

  try {
      const response = await API.post(`/api/posts/${id}/comment`, comment, { headers });
      return response.data;
  } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
  }
};


// export const fetchNotifications = async () => {
//   const response = await fetch('/api/notifications', {
//     headers: {
//       'Authorization': `Bearer ${localStorage.getItem('authToken')}`
//     }
//   });
//   return response.json();
// };

// export const markNotificationAsRead = async (notificationId) => {
//   const response = await fetch(`/api/notifications/${notificationId}/read`, {
//     method: 'PUT',
//     headers: {
//       'Authorization': `Bearer ${localStorage.getItem('authToken')}`
//     }
//   });
//   return response.json();
// };

// Add these to your existing api.js exports
export const fetchNotifications = async () => {
  const authToken = localStorage.getItem('authToken');
  return await API.get('/api/notifications', {
    headers: {
      Authorization: `Bearer ${authToken}`
    }
  });
};

export const fetchUnreadNotificationsCount = async () => {
  const authToken = localStorage.getItem('authToken');
  return await API.get('/api/notifications/unread-count', {
    headers: {
      Authorization: `Bearer ${authToken}`
    }
  });
};

export const markNotificationAsRead = async (notificationId) => {
  const authToken = localStorage.getItem('authToken');
  return await API.put(`/api/notifications/${notificationId}/read`, {}, {
    headers: {
      Authorization: `Bearer ${authToken}`
    }
  });
};

export const clearAllNotifications = async () => {
  const authToken = localStorage.getItem('authToken');
  return await API.delete('/api/notifications', {
    headers: {
      Authorization: `Bearer ${authToken}`
    }
  });
};

// feedback adding route
export const addFeedback = (data) => {
  const authToken = localStorage.getItem('authToken');
  const headers = {
    'Content-Type': 'multipart/form-data',
    Authorization: `Bearer ${authToken}`,
  };
  return API.post('/api/feedback/addFeedback', data, { headers });
};

export const updateUserProfile = async (userId, userData) => {
  const authToken = localStorage.getItem('authToken');
  const headers = authToken ? { 
    Authorization: `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  } : {};
  
  return await API.put(`/api/auth/update-profile/${userId}`, userData, { headers });
};

export const updateProfilePicture = async (userId, profilePic) => {
  const authToken = localStorage.getItem('authToken');
  const headers = authToken ? { 
    Authorization: `Bearer ${authToken}`,
    'Content-Type': 'multipart/form-data'
  } : {};
  
  const formData = new FormData();
  formData.append('profilePic', profilePic);
  
  return await API.put(`/api/auth/update-profile-pic/${userId}`, formData, { headers });
};

export const deleteProfilePicture = async (userId) => {
  const authToken = localStorage.getItem('authToken');
  const headers = authToken ? { 
    Authorization: `Bearer ${authToken}`
  } : {};
  
  return await API.delete(`/api/auth/delete-profile-pic/${userId}`, { headers });
};

// Report a post
export const reportPost = async (postId, reportTypes, comment) => {
  const authToken = localStorage.getItem('authToken');
  return await API.post('/api/reports/report-post', {
    postId,
    reportTypes,
    comment
  }, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
};

// Check if post is reported by user
export const checkPostReported = async (postId) => {
  const authToken = localStorage.getItem('authToken');
  const response = await API.get(`/api/reports/check-reported/${postId}`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
  return response.data.hasReported;
};

// get user posts
export const fetchProfilePosts = async (userId) => {
  const authToken = localStorage.getItem('authToken');
  return await API.get(`/api/auth/user-posts/${userId}`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
};

// get user's profile data
export const fetchUserProfileData = async (userId) => {
  const authToken = localStorage.getItem('authToken');
  return await API.get(`/api/auth/user-profile/${userId}`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
};

// checking post owner already rated or not the helper
export const checkExistingRating = async (userId, postId) => {
  const authToken = localStorage.getItem('authToken');
  const headers = authToken ? { 
    Authorization: `Bearer ${authToken}`
  } : {};
  
  return await API.get(`/api/auth/check-rating/${userId}/${postId}`, { headers });
};

// fetch logged in user profile
export const fetchUserProfile = async (userId) => {
  const authToken = localStorage.getItem('authToken');
  const headers = authToken ? { 
    Authorization: `Bearer ${authToken}`
  } : {};
  return await API.get(`/api/auth/profile/${userId}`, { headers });
};

// API functions for follow system
export const followUser = async (userId) => {
  const authToken = localStorage.getItem('authToken');
  const headers = authToken ? { 
    Authorization: `Bearer ${authToken}`
  } : {};
  
  return await API.post(`/api/auth/follow/${userId}`, {}, { headers });
};

export const unfollowUser = async (userId) => {
  const authToken = localStorage.getItem('authToken');
  const headers = authToken ? { 
    Authorization: `Bearer ${authToken}`
  } : {};
  
  return await API.post(`/api/auth/unfollow/${userId}`, {}, { headers });
};

// Fetch user's followers with pagination
export const fetchUserFollowers = async (userId, page = 1, limit = 10) => {
  const authToken = localStorage.getItem('authToken');
  const headers = authToken ? { 
    Authorization: `Bearer ${authToken}`
  } : {};
  return await API.get(`/api/auth/${userId}/followers?page=${page}&limit=${limit}`, { headers });
};

// Fetch user's following with pagination
export const fetchUserFollowing = async (userId, page = 1, limit = 10) => {
  const authToken = localStorage.getItem('authToken');
  const headers = authToken ? { 
    Authorization: `Bearer ${authToken}`
  } : {};
  return await API.get(`/api/auth/${userId}/following?page=${page}&limit=${limit}`, { headers });
};

export const getUserProfile = async (userId) => {
  const authToken = localStorage.getItem('authToken');
  const headers = authToken ? { 
    Authorization: `Bearer ${authToken}`
  } : {};
  
  return await API.get(`/api/auth/profile/${userId}`, { headers });
};

// submit ID verification documents
export const submitIdVerification = async (userId, formData) => {
  const authToken = localStorage.getItem('authToken');
  const headers = authToken ? { 
    Authorization: `Bearer ${authToken}`,
    'Content-Type': 'multipart/form-data'
  } : {};
  
  return await API.post(`/api/auth/id-verification/submit/${userId}`, formData, { headers });
};

// export const getIdVerificationStatus = async (userId) => {
//   const authToken = localStorage.getItem('authToken');
//   const headers = authToken ? { 
//     Authorization: `Bearer ${authToken}`
//   } : {};
  
//   return await API.get(`/api/auth/id-verification/status/${userId}`, { headers });
// };

// cancel ID verification process by user
export const cancelIdVerification = async (userId) => {
  const authToken = localStorage.getItem('authToken');
  const headers = authToken ? { 
    Authorization: `Bearer ${authToken}`
  } : {};
  
  return await API.delete(`/api/auth/id-verification/cancel/${userId}`, { headers });
};


// User coupon request
export const requestCoupon = () => {
  return API.post('/api/coupon/request-coupon');
};

export const getMyCouponRequest = () => {
  return API.get('/api/coupon/my-coupon-request');
};

export const getMyCoupon = () => {
  return API.get('/api/coupon/my-coupon');
};