// src/api/adminApi.js
import axios from 'axios';

const API = axios.create({ baseURL: process.env.REACT_APP_API_URL });

export default API;


export const searchUsers = (query) => {
  const authToken = localStorage.getItem('authToken');
  const headers = {
    Authorization: `Bearer ${authToken}`,
  };
  return API.get(`/api/admin/searchUsers?query=${encodeURIComponent(query)}`, { headers });
};

export const updateAccountStatus = (userId, status) => {
  const authToken = localStorage.getItem('authToken');
  const headers = {
    Authorization: `Bearer ${authToken}`,
  };
  return API.patch('/api/admin/updateAccountStatus', { userId, status }, { headers });
};

export const filterUsersByStatus = (status) => {
  const authToken = localStorage.getItem('authToken');
  const headers = {
    Authorization: `Bearer ${authToken}`,
  };
  return API.get(`/api/admin/filterUsers?status=${status}`, { headers });
};

export const getUserCounts = () => {
  const authToken = localStorage.getItem('authToken');
  const headers = {
    Authorization: `Bearer ${authToken}`,
  };
  return API.get('/api/admin/userCounts', { headers });
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