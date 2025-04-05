/**
 * Socket Service
 * Handles all Socket.IO related functionality and real-time communication
 * @module services/socket
 */

import { Server } from 'socket.io';

let io;
let onlineUsers = [];

/**
 * Initialize Socket.IO instance
 * @param {Object} server - HTTP server instance
 * @returns {Object} Configured Socket.IO instance
 */
export const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:5500',
            methods: ['GET', 'POST']
        }
    });

    setupSocketEvents();
    return io;
};

/**
 * Set up all socket event handlers
 */
const setupSocketEvents = () => {
    io.on('connection', handleConnection);
};

/**
 * Handle new socket connections
 * @param {Object} socket - Socket instance
 */
const handleConnection = (socket) => {
    console.log('A user connected:', socket.id)
    socket.on('userOnline', (username) => handleUserOnline(socket, username));
    socket.on('userOffline', (username) => handleUserOffline(socket, username));
    socket.on('joinedConversation', (conversationId) => handleJoinConversation(socket, conversationId));
    socket.on('disconnect', () => handleDisconnect(socket));
    socket.on('getOnlineUsers', () => handleGetOnlineUsers(socket));
};

/**
 * Handle request for online users list
 * @param {Object} socket - Socket instance
 */
const handleGetOnlineUsers = (socket) => {
    console.log('Sending online users list:', onlineUsers);
    socket.emit('onlineUsers', onlineUsers);
};

/**
 * Handle user coming online
 * @param {Object} socket - Socket instance
 * @param {string} username - Username of connected user
 */
const handleUserOnline = (socket, username) => {
    if (!onlineUsers.includes(username)) {
        onlineUsers.push(username);
        console.log(`User ${username} is online`);
        io.emit('onlineUsers', onlineUsers); // Broadcast to all connected clients
    }
};

/**
 * Handle user going offline
 * @param {Object} socket - Socket instance
 * @param {string} username - Username of disconnected user
 */
const handleUserOffline = (socket, username) => {
    onlineUsers = onlineUsers.filter(user => user !== username);
    console.log(`User ${username} went offline`);
    io.emit('onlineUsers', onlineUsers); // Broadcast to all connected clients
};

/**
 * Handle user joining a conversation room
 * @param {Object} socket - Socket instance
 * @param {string} conversationId - ID of the conversation to join
 */
const handleJoinConversation = (socket, conversationId) => {
    socket.join(conversationId);
    console.log(`User joined chat: ${conversationId}`);
};

/**
 * Handle socket disconnection
 * @param {Object} socket - Socket instance
 */
const handleDisconnect = (socket) => {
    console.log('User disconnected:', socket.id);
    // We don't remove the user from onlineUsers here because they might be refreshing
    // The userOffline event will handle that when explicitly called
};

/**
 * Get the Socket.IO instance
 * @returns {Object} Socket.IO instance
 */
export const getIO = () => {
    if (!io) {
        throw new Error('Socket.IO not initialized');
    }
    return io;
};

/**
 * Get list of online users
 * @returns {Array} List of online usernames
 */
export const getOnlineUsers = () => {
    return onlineUsers;
};

/**
 * Emit event to specific room
 * @param {string} room - Room/conversation ID
 * @param {string} event - Event name
 * @param {*} data - Data to emit
 */
export const emitToRoom = (room, event, data) => {
    io.to(room).emit(event, data);
};

/**
 * Emit event to all connected clients
 * @param {string} event - Event name
 * @param {*} data - Data to emit
 */
export const emitToAll = (event, data) => {
    io.emit(event, data);
}; 