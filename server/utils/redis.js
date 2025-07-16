const { createClient } = require('redis');

let redisClient = null;

const connectRedis = async () => {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      console.log('📦 Connected to Redis');
    });

    await redisClient.connect();
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    // Fallback to in-memory storage if Redis is not available
    console.log('⚠️  Using in-memory storage as fallback');
  }
};

const getRedisClient = () => {
  return redisClient;
};

// Helper functions for session management
const setSessionData = async (sessionId, key, data, ttl = 3600) => {
  if (!redisClient) return false;
  
  try {
    const sessionKey = `session:${sessionId}:${key}`;
    await redisClient.setEx(sessionKey, ttl, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error setting session data:', error);
    return false;
  }
};

const getSessionData = async (sessionId, key) => {
  if (!redisClient) return null;
  
  try {
    const sessionKey = `session:${sessionId}:${key}`;
    const data = await redisClient.get(sessionKey);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting session data:', error);
    return null;
  }
};

const deleteSessionData = async (sessionId, key) => {
  if (!redisClient) return false;
  
  try {
    const sessionKey = `session:${sessionId}:${key}`;
    await redisClient.del(sessionKey);
    return true;
  } catch (error) {
    console.error('Error deleting session data:', error);
    return false;
  }
};

const extendSessionTTL = async (sessionId, key, ttl = 3600) => {
  if (!redisClient) return false;
  
  try {
    const sessionKey = `session:${sessionId}:${key}`;
    await redisClient.expire(sessionKey, ttl);
    return true;
  } catch (error) {
    console.error('Error extending session TTL:', error);
    return false;
  }
};

module.exports = {
  connectRedis,
  getRedisClient,
  setSessionData,
  getSessionData,
  deleteSessionData,
  extendSessionTTL
};