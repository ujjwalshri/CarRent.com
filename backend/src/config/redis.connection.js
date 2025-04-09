/**
 * Redis Client Configuration
 * 
 * This module sets up and exports a Redis client instance for caching.
 * It uses the redis package to create a client that connects to either
 * a Redis URL specified in environment variables or defaults to localhost.
 */

import { createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Create Redis client instance
 * Uses REDIS_URL from environment if available, otherwise connects to localhost
 */
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

// Set up error handling for Redis connection
redisClient.on('error', (err) => console.error('Redis error:', err));

// Connect to Redis server
redisClient.connect().catch(err => {
  console.error('Failed to connect to Redis:', err);
  // Don't crashes the server if Redis connection fails
});


export default redisClient; // export the redis client
