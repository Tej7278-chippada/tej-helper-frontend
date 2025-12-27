// src/api/cacheApi.js
import API from './adminApi';

// Get cache statistics
export const getCacheStats = () => {
  return API.get('/api/cache/stats');
};

// Clear specific cache by pattern
export const clearCacheByPattern = (pattern) => {
  return API.post('/api/cache/clear', { pattern });
};

// Clear all cache
export const clearAllCache = () => {
  return API.post('/api/cache/clear-all');
};

// Warm up cache
export const warmUpCache = () => {
  return API.post('/api/cache/warm-up');
};

// Get Redis info
export const getRedisInfo = () => {
  return API.get('/api/cache/redis-info');
};

// Flush cache for specific user
export const flushUserCache = (userId) => {
  return API.post(`/api/cache/flush-user/${userId}`);
};

// Flush cache for specific post
export const flushPostCache = (postId) => {
  return API.post(`/api/cache/flush-post/${postId}`);
};

// Get cache health status
export const getCacheHealth = () => {
  return API.get('/health/health');
};

// Invalidate cache patterns
export const invalidateCache = async (patterns) => {
  try {
    const promises = patterns.map(pattern => 
      API.post('/api/cache/clear', { pattern })
    );
    await Promise.all(promises);
    return { success: true };
  } catch (error) {
    console.error('Error invalidating cache:', error);
    return { success: false, error: error.message };
  }
};