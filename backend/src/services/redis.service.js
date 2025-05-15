import redisClient  from '../config/redis.connection.js';
/**
 * Redis Service
 * 
 * This module provides functions to interact with Redis for caching purposes.
 * It includes methods to get, set, delete, and clear cached data.
 * 
 * @module redisService
 */
export const getCachedData = async (key) => {
    try {
        const cachedData = await redisClient.get(key);
        return cachedData ? JSON.parse(cachedData) : null;
    } catch (err) {
        console.error(`Redis GET error for key "${key}":`, err);
        return null;
    }
};

export const setCachedData = async (key, data, ttl = 60) => {
    try {
        await redisClient.setEx(key, ttl, JSON.stringify(data));
    } catch (err) {
        console.error(`Redis SETEX error for key "${key}":`, err);
    }
};

export const deleteCachedData = async (key) => {
    try {
        await redisClient.del(key);
    } catch (err) {
        console.error(`Redis DEL error for key "${key}":`, err);
    }
};

export const clearAllCachedData = async () => {
    try {
        await redisClient.flushAll();
    } catch (err) {
        console.error('Redis FLUSHALL error:', err);
    }
};
