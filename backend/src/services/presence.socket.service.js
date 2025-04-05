/**
 * Presence Socket Service
 * Handles all real-time user presence functionality
 * @module services/presence.socket
 */

import { getIO, emitToAll, getOnlineUsers } from './socket.service.js';

/**
 * Broadcast online users list to all connected clients
 */
export const broadcastOnlineUsers = () => {
    emitToAll('onlineUsers', getOnlineUsers());
};

/**
 * Notify all users when a user comes online
 * @param {string} username - Username of the user who came online
 */
export const notifyUserOnline = (username) => {
    emitToAll('userOnline', { username });
};

/**
 * Notify all users when a user goes offline
 * @param {string} username - Username of the user who went offline
 */
export const notifyUserOffline = (username) => {
    emitToAll('userOffline', { username });
};

/**
 * Get current online users
 * @returns {Array} List of online usernames
 */
export const getOnlineUsersList = () => {
    return getOnlineUsers();
}; 