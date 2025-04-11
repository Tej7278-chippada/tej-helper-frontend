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
export const fetchUserPosts = () => {
  const authToken = localStorage.getItem('authToken');
  const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
  return API.get('/api/posts/my-posts', { headers });
};

// export const fetchPosts = () => API.get('/api/posts');
export const fetchPosts = (skip = 0, limit = 12) => 
  API.get(`/api/posts?skip=${skip}&limit=${limit}`);

export const fetchPostById = async (id) => {
  const authToken = localStorage.getItem('authToken');
  const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};

  return await API.get(`/api/posts/${id}`, { headers });
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