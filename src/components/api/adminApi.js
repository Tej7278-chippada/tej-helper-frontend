// src/api/adminApi.js
import axios from 'axios';

const API = axios.create({ baseURL: process.env.REACT_APP_API_URL });

export default API;


export const searchUsers = (query, page = 1, limit = 20) => {
  const authToken = localStorage.getItem('authToken');
  const headers = {
    Authorization: `Bearer ${authToken}`,
  };
  return API.get(`/api/admin/searchUsers?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`, { headers });
};

export const updateAccountStatus = (userId, status) => {
  const authToken = localStorage.getItem('authToken');
  const headers = {
    Authorization: `Bearer ${authToken}`,
  };
  return API.patch('/api/admin/updateAccountStatus', { userId, status }, { headers });
};

export const filterUsersByStatus = (status, page = 1, limit = 20, search = '') => {
  const authToken = localStorage.getItem('authToken');
  const headers = {
    Authorization: `Bearer ${authToken}`,
  };
  return API.get(`/api/admin/filterUsers?status=${status}&page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`, { headers });
};

export const getUserCounts = () => {
  const authToken = localStorage.getItem('authToken');
  const headers = {
    Authorization: `Bearer ${authToken}`,
  };
  return API.get('/api/admin/userCounts', { headers });
};

// Get all feedbacks for admin
export const getAllFeedbacks = () => {
  const authToken = localStorage.getItem('authToken');
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authToken}`,
  };
  return API.get('/api/feedback/all-feedbacks', { headers });
};

// Update feedback status (admin only)
export const updateFeedbackStatus = (id, data) => {
  const authToken = localStorage.getItem('authToken');
  return API.put(`/api/feedback/update-feedback/${id}`, data, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
};

// Delete feedback (admin only)
export const deleteFeedback = (id) => {
  const authToken = localStorage.getItem('authToken');
  const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
  return API.delete(`/api/feedback/${id}`, { headers });
};

export const addAdminBanner = (data) => {
  const authToken = localStorage.getItem('authToken');
  const headers = {
    'Content-Type': 'multipart/form-data',
    Authorization: `Bearer ${authToken}`,
  };
  return API.post('/api/banner/addBanner', data, { headers });
};

export const updateAdminBanner = (id, data) => {
  const authToken = localStorage.getItem('authToken');
  const headers = {
    'Content-Type': 'multipart/form-data',
    Authorization: `Bearer ${authToken}`,
  };
  return API.put(`/api/banner/${id}`, data, { headers });
};

export const deleteAdminBanner = (id) => {
  const authToken = localStorage.getItem('authToken');
  const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
  return API.delete(`/api/banner/${id}`, { headers });
};

// Fetch user's own posts
export const fetchAdminBanners = () => {
  const authToken = localStorage.getItem('authToken');
  const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
  return API.get('/api/banner/my-banners', { headers });
};

export const fetchBannerMediaById = async (bannerId) => {
  // const authToken = localStorage.getItem('authToken');
  // const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};

  return await API.get(`/api/banner/bannerMedia/${bannerId}`);
};

export const imageGenerationBanner = (query) => {
  const authToken = localStorage.getItem('authToken');
  const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
  return API.get(`/api/banner/generate-images?query=${query}`, { headers });
};

// Post Status Management APIs
export const triggerPostStatusUpdate = () => {
  const authToken = localStorage.getItem('authToken');
  const headers = {
    Authorization: `Bearer ${authToken}`,
  };
  return API.post('/api/admin/post-status/trigger-update', {}, { headers });
};

export const getPostStatusStats = () => {
  const authToken = localStorage.getItem('authToken');
  const headers = {
    Authorization: `Bearer ${authToken}`,
  };
  return API.get('/api/admin/post-status/stats', { headers });
};

export const getPendingUpdates = (page = 1, limit = 50, postType = '') => {
  const authToken = localStorage.getItem('authToken');
  const headers = {
    Authorization: `Bearer ${authToken}`,
  };
  const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
  if (postType) params.append('postType', postType);
  
  return API.get(`/api/admin/post-status/pending-updates?${params.toString()}`, { headers });
};

export const getUpdateHistory = () => {
  const authToken = localStorage.getItem('authToken');
  const headers = {
    Authorization: `Bearer ${authToken}`,
  };
  return API.get('/api/admin/post-status/update-history', { headers });
};