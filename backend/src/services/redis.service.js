import redisClient from "../config/redis.connection.js";

export const getCachedData = async (key) => {
    const cachedData = await redisClient.get(key);
    return cachedData ? JSON.parse(cachedData) : null;
};

export const setCachedData = async (key, data, ttl = 60) => {
    await redisClient.setEx(key, ttl, JSON.stringify(data));
};

export const deleteCachedData = async (key) => {
    await redisClient.del(key);
};

export const clearAllCachedData = async () => {
    await redisClient.flushall();
};