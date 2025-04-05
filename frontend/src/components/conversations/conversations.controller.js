angular
  .module("myApp")
  .controller(
    "conversationsCtrl",
    function (
      $scope,
      $stateParams,
      $timeout,
      RouteProtection,
      ChatService,
      $q,
      ToastService,
      $timeout,
      $uibModal
    ) {
      // Data collections
      $scope.myConversations = []; // List of user's active conversations
      $scope.messages = []; // Messages for currently selected conversation
      $scope.onlineUsers = []; // Users currently active in the system
      
      // UI state tracking
      $scope.selectedConversation = null; // Currently selected/active conversation
      $scope.isLoading = false; // Main content loading state
      $scope.messageLoading = false; // Message loading state
      
      // User input handling
      $scope.inputMessage = ""; // Current message being composed
      $scope.loggedInUser = null; // Current user's profile
      $scope.image; // Image attachment for current message
      
      // Websocket connection
      let socket = null; // Socket.io connection for real-time messaging
      
      // ==========================================
      // INITIALIZATION & SOCKET SETUP
      // ==========================================
      
      // Main initialization function - called on controller load
      // Sets up socket connections and fetches initial conversation data
      $scope.init = () => {
        // Begin loading sequence
        $scope.isLoading = true;
        
        // Execute parallel API requests first
        $q.all([
          RouteProtection.getLoggedinUser(),
          $stateParams.id == 0
            ? ChatService.getAllConversations()
            : ChatService.getConversationsAtCarId($stateParams.id),
        ])
          .then(([user, conversations]) => {
            // Store user data and conversation list
            $scope.loggedInUser = user;
            $scope.myConversations = conversations.conversations;
            
            // Initialize socket connection after we have user data
            socket = io("http://localhost:8000", {
              reconnection: true,
              reconnectionDelay: 1000,
              reconnectionDelayMax: 5000,
            });
            
            // Set up socket event listeners
            socket.on("newMessage", (message) => {
                console.log(message);
                $scope.messages.push(message);
                $scope.scrollToBottom();
                $timeout();
            });

            socket.on("onlineUsers", (users) => {
              console.log('Received online users:', users);
              $scope.onlineUsers = users || [];
              $timeout();
            });

            socket.on("newConversation", (conversation) => {
              if (
                conversation.sender._id === $scope.loggedInUser._id ||
                conversation.receiver._id === $scope.loggedInUser._id
              ) {
                $scope.myConversations.push(conversation);
                $timeout();
              }
            });

            socket.on("connect", () => {
              console.log('Socket connected, emitting userOnline');
              // Request current online users list
              socket.emit('getOnlineUsers');
              // Then emit this user's online status
              socket.emit('userOnline', user.username);
              $timeout();
            });

            socket.on("disconnect", () => {
              console.log('Socket disconnected');
              // Clear online users on disconnect
              $scope.onlineUsers = [];
              $timeout();
            });

            socket.on("reconnect", () => {
              console.log('Socket reconnected, requesting online users and emitting status');
              // Request current online users list
              socket.emit('getOnlineUsers');
              // Re-emit this user's online status
              socket.emit('userOnline', user.username);
              $timeout();
            });

            socket.on("error", (error) => {
              console.error('Socket error:', error);
              $timeout(() => {
                ToastService.error('Connection error. Please refresh the page.');
              });
            });

            // Initial connection
            if (socket.connected) {
              console.log('Socket already connected, requesting initial data');
              socket.emit('getOnlineUsers');
              socket.emit('userOnline', user.username);
            }
          })
          .catch((err) => {
            ToastService.error(`Error fetching user ${err.data.message}`);
          })
          .finally(() => {
            $scope.isLoading = false;
          });
      };

      // Handle controller destruction (navigation away)
      $scope.$on("$destroy", function () {
        if (socket && $scope.loggedInUser) {
          // Notify socket server that user is offline
          socket.emit('userOffline', $scope.loggedInUser.username);
          
          // Disconnect socket
          socket.disconnect();
        }
      });
      
      // ==========================================
      // UI HELPERS & MESSAGE DISPLAY
      // ==========================================
      
      // Scrolls the chat box to display the most recent messages
      // Called after new messages are added or conversation changes
      $scope.scrollToBottom = function () {
        // Delay execution to ensure DOM has updated with new messages
        $timeout(function () {
          // Find chat container element
          var chatBox = document.getElementById("chatBox");
          if (chatBox) {
            // Scroll to bottom of container
            chatBox.scrollTop = chatBox.scrollHeight;
          }
        }, 100); // Short delay ensures DOM has updated
      };
      
      // ==========================================
      // CONVERSATION & MESSAGE MANAGEMENT
      // ==========================================

      // Retrieves and displays messages for a selected conversation
      // Called when user clicks on a conversation in the list
      $scope.fetchMessages = (conversationId) => {
        // Set loading state for message area
        messageLoading = true;
        
        // Ensure newest messages will be visible
        $scope.scrollToBottom();
        
        // Find the full conversation object by ID
        $scope.selectedConversation = $scope.myConversations.find(
            (conversation) => conversation._id === conversationId
        );
         
        // Join the conversation's socket room for real-time updates
        socket.emit("joinedConversation", $scope.selectedConversation._id);
        
        // Fetch all messages for this conversation
        ChatService.getAllMessages(conversationId)
          .then((messages) => {
            console.log(messages.messages);
            // Update message list with fetched data
            $scope.messages = messages.messages;
          })
          .catch((err) => {
            // Display error notification if message fetch fails
            ToastService.error(`Error fetching messages ${err}`);
          }).finally(()=>{
            // Reset message loading state
            $scope.messageLoading = false;
          })
      };
      
      // ==========================================
      // FILE HANDLING & MEDIA UPLOADS
      // ==========================================

      // Handles image file selection and preview
      // Called when user selects an image file to attach
      $scope.previewImages = function (input) {
        console.log(input);
        if (input.files) {
          console.log(input.files);
          
          // Store selected image file for upload
          $scope.image = input.files[0];
          
          // Trigger digest cycle to update UI with preview
          $timeout();
        }
        input.value = null;
      };
      
      // ==========================================
      // MESSAGE COMPOSITION & SENDING
      // ==========================================
      
      // Monitors keyboard input for Enter key press
      // Allows sending messages with Enter key
      $scope.checkEnter = function (event) {
        if (event.keyCode === 13) { // Enter key code
          // Prevent default form submission behavior
          event.preventDefault();
          
          // Send the current message
          $scope.sendMessage();
        }
      };

      // Sends the current message with any attachments
      // Called when user clicks send or presses Enter
      $scope.sendMessage = () => {
        console.log($scope.image);
        
        // Get the ID of the active conversation
        const conversationId = $scope.selectedConversation._id;
        
        // Validate that message has content (text or image)
        if ($scope.inputMessage.trim() === "" && $scope.image === undefined)
          return; // Exit if message is empty with no attachments
          
        // Create message object with text content
        const message = {
          message: $scope.inputMessage.trim(),
        };

        // Create FormData object for sending mixed content (text + files)
        const formData = new FormData();
        
        // Add text message to form data
        formData.append("message", message.message);

        // Add image attachment if present
        if ($scope.image) {
           formData.append("image", $scope.image);
        }
        console.log($scope.image);

        // Send message to server
        ChatService.addMessage(formData, conversationId)
          .then((res) => {
            // Reset input fields after successful send
            // Ensure newest message is visible
            $scope.scrollToBottom();
          })
          .catch((error) => {
            // Display error notification if send fails
            ToastService.error(`Error adding message ${error}`);
          }).finally(()=>{
            // Clear text input
            $scope.inputMessage = "";
            // Clear file input
            $scope.image = undefined;

            $timeout();
          })
      };

      // ==========================================
      // USER STATUS HELPERS
      // ==========================================
      
      // Determines if the other user in a conversation is currently online
      // Used to display online status indicators in conversation list
      $scope.isUserOnline = function(conversation) {
        // Guard against missing data
        if (!conversation || !$scope.onlineUsers || !$scope.loggedInUser) {
          return false;
        }
        
        // Determine which user in the conversation isn't the current user
        const otherUserName = conversation.reciever.username === $scope.loggedInUser.username ? 
          conversation.sender.username : conversation.reciever.username;
          
        // Check if other user is in the online users list
        return $scope.onlineUsers.includes(otherUserName);
      };

      $scope.openImagesModal = () => {
        if (!$scope.selectedConversation) {
          ToastService.error("Please select a conversation first");
          return;
        }

        const modalInstance = $uibModal.open({
          templateUrl: 'imagesModal.html',
          controller: 'ImagesModalCtrl',
          size: 'lg',
          resolve: {
            conversationId: function() {
              return $scope.selectedConversation._id;
            }
          }
        });
      };
    }
  )
  .controller('ImagesModalCtrl', function($scope, $uibModalInstance, conversationId, ChatService, ToastService) {
    $scope.isLoading = true;
    $scope.images = [];

    $scope.close = function() {
      $uibModalInstance.dismiss('cancel');
    };

    // Load images when modal opens
    ChatService.getAllAttachments(conversationId)
      .then((response) => {
        console.log(response.attachments);
        $scope.images = response.attachments;
      })
      .catch((err) => {
        ToastService.error("Error loading images: " + err);
      })
      .finally(() => {
        $scope.isLoading = false;
      });
  });
