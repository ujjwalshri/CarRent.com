/**
 * Socket Service
 * 
 * Angular service that handles all Socket.IO functionality for real-time communication
 * Provides methods for socket events and maintains connection state
 */
angular.module('myApp').service('SocketService', function($timeout, ApiService) {
    // Socket.io instance
    let socket = null;
    
    // Current user information
    let currentUser = null;
    
    // Online users list
    let onlineUsers = [];
    
    // Custom event callbacks storage
    const eventListeners = {
        newMessage: [],
        newConversation: [],
        onlineUsers: [],
        bidSuccess: []
    };
    
    /**
     * Initialize socket connection
     * @param {Object} user - Current user object
     * @returns {Object} Socket instance
     */
    this.initialize = function(user) {
        // Store current user
        currentUser = user;
        
        // Disconnect existing socket if any
        if (socket) {
            console.log('Disconnecting existing socket connection');
            socket.disconnect();
            socket = null;
        }
        
        // Create new socket connection
        console.log('Creating new socket connection for', user.username);
        socket = io(ApiService.baseURL || "http://localhost:8000", {
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            query: {
                username: user.username // Send username with connection
            }
        });
        
        // Set up internal event handlers
        setupSocketEvents();
        
        return socket;
    };
    
    /**
     * Set up all socket events
     */
    const setupSocketEvents = () => {
        // Handle connection events
        socket.on("connect", () => {
            console.log('Socket connected');
            if (currentUser) {
                // Join user room immediately
                socket.emit('joinUserRoom', currentUser.username);
                // Set user online immediately
                socket.emit('userOnline', currentUser.username);
                // Get online users
                socket.emit('getOnlineUsers');
            }
        });
        
        socket.on("disconnect", () => {
            console.log('Socket disconnected');
            if (currentUser) {
                this.setUserOffline(currentUser.username);
            }
            onlineUsers = [];
            // Trigger onlineUsers callback with empty list
            triggerEvent('onlineUsers', []);
        });
        
        socket.on("reconnect", () => {
            console.log('Socket reconnected');
            if (currentUser) {
                // Join user room again
                socket.emit('joinUserRoom', currentUser.username);
                // Set user online again
                socket.emit('userOnline', currentUser.username);
                // Get online users
                socket.emit('getOnlineUsers');
            }
        });
        
        socket.on("error", (error) => {
            console.error('Socket error:', error);
        });
        
        // Handle application events
        socket.on("onlineUsers", (users) => {
            console.log('Received online users:', users);
            onlineUsers = users || [];
            triggerEvent('onlineUsers', onlineUsers);
        });
        
        socket.on("newMessage", (message) => {
            console.log('New message received:', message);
            triggerEvent('newMessage', message);
        });
        
        socket.on("newConversation", (conversation) => {
            console.log('New conversation received:', conversation);
            triggerEvent('newConversation', conversation);
        });

        socket.on("userOnline", (username) => {
            console.log('User came online:', username);
            if (!onlineUsers.includes(username)) {
                onlineUsers.push(username);
                triggerEvent('onlineUsers', onlineUsers);
            }
        });

        socket.on("userOffline", (username) => {
            console.log('User went offline:', username);
            const index = onlineUsers.indexOf(username);
            if (index > -1) {
                onlineUsers.splice(index, 1);
                triggerEvent('onlineUsers', onlineUsers);
            }
        });

        // Add bid success event handler
        socket.on("bidSuccess", (bidData) => {
            console.log('Bid success received:', bidData);
            triggerEvent('bidSuccess', bidData);
        });
    };
    
    /**
     * Trigger callbacks for registered event listeners
     * @param {string} eventName - Name of the event
     * @param {any} data - Event data to pass to callbacks
     */
    const triggerEvent = (eventName, data) => {
        if (eventListeners[eventName]) {
            eventListeners[eventName].forEach(callback => {
                // Use $timeout to ensure digest cycle is triggered
                $timeout(() => callback(data));
            });
        }
    };
    
    /**
     * Register event listener
     * @param {string} eventName - Event to listen for
     * @param {Function} callback - Callback function
     */
    this.on = function(eventName, callback) {
        console.log('Registering event listener for:', eventName);
        if (!eventListeners[eventName]) {
            eventListeners[eventName] = [];
        }
        eventListeners[eventName].push(callback);
    };
    
    /**
     * Remove event listener
     * @param {string} eventName - Event name
     * @param {Function} callback - Callback to remove
     */
    this.off = function(eventName, callback) {
        if (eventListeners[eventName]) {
            if (callback) {
                eventListeners[eventName] = eventListeners[eventName].filter(cb => cb !== callback);
            } else {
                // If no callback provided, remove all listeners for this event
                eventListeners[eventName] = [];
            }
        }
    };
    
    /**
     * Join a conversation room
     * @param {string} conversationId - ID of conversation to join
     */
    this.joinConversation = function(conversationId) {
        if (socket) {
            socket.emit("joinedConversation", conversationId);
        }
    };
    
    /**
     * Join a bidding room
     * @param {string} biddingId - ID of bidding to join
     */
    this.joinBidding = function(biddingId) {
        if (socket) {
            socket.emit("joinedBidding", biddingId);
        }
    };
    
    /**
     * Join user's personal notification room
     * This is used for user-specific notifications
     */
    this.joinUserRoom = function() {
        if (socket && currentUser) {
            socket.emit("joinUserRoom", currentUser.username);
        }
    };
    
    /**
     * Set user as online
     * @param {string} username - Username to set as online
     */
    this.setUserOnline = function(username) {
        if (socket && username) {
            socket.emit('userOnline', username);
        }
    };
    
    /**
     * Set user as offline
     * @param {string} username - Username to set as offline
     */
    this.setUserOffline = function(username) {
        if (socket && username) {
            socket.emit('userOffline', username);
        }
    };
    
    /**
     * Request online users list
     */
    this.getOnlineUsers = function() {
        if (socket) {
            socket.emit('getOnlineUsers');
        }
    };
    
    /**
     * Get current online users
     * @returns {Array} Array of online usernames
     */
    this.getCurrentOnlineUsers = function() {
        return onlineUsers;
    };
    
    /**
     * Check if a user is online
     * @param {string} username - Username to check
     * @returns {boolean} True if user is online
     */
    this.isUserOnline = function(username) {
        return onlineUsers.includes(username);
    };
    
    /**
     * Disconnect socket
     */
    this.disconnect = function() {
        if (socket && currentUser) {
            this.setUserOffline(currentUser.username);
            socket.disconnect();
        }
    };
    
    /**
     * Get socket instance
     * @returns {Object} Socket instance
     */
    this.getSocket = function() {
        return socket;
    };
}); 