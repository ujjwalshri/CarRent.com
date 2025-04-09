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
      SocketService,
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
      
      // Main initialization function - called on controller load
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
            
            // Initialize socket service with current user
            SocketService.initialize(user);
            
            // Setup socket event listeners
            SocketService.on("newMessage", (message) => {
              console.log('New message received:', message);
                $scope.messages.push(message);
                $scope.scrollToBottom();
            });

            SocketService.on("onlineUsers", (users) => {
              console.log('Received online users:', users);
                $scope.onlineUsers = users || [];
                $timeout();
            });

            SocketService.on("newConversation", (conversation) => {
              if (
                conversation.sender._id === $scope.loggedInUser._id ||
                conversation.reciever._id === $scope.loggedInUser._id
              ) {
                  $scope.myConversations.push(conversation);
                  $timeout();
              }
            });

            // Join user's personal room for notifications
            SocketService.joinUserRoom($scope.loggedInUser.username);
            // Request current online users
            SocketService.getOnlineUsers();
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
        // Clean up socket event listeners
        SocketService.off("newMessage");
        SocketService.off("onlineUsers");
        SocketService.off("newConversation");
        // No need to handle disconnect - service handles it automatically
      });
      
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
      
      // Retrieves and displays messages for a selected conversation
      // Called when user clicks on a conversation in the list
      $scope.fetchMessages = (conversationId) => {
        // Set loading state for message area
        $scope.messageLoading = true;
        
        // Clear existing messages
        $scope.messages = [];
        
        // Find the full conversation object by ID
        $scope.selectedConversation = $scope.myConversations.find(
            (conversation) => conversation._id === conversationId
        );
        
        if (!$scope.selectedConversation) {
          ToastService.error("Conversation not found");
          $scope.messageLoading = false;
          return;
        }
         
        // Join the conversation's socket room for real-time updates
        SocketService.joinConversation($scope.selectedConversation._id);
        
        // Fetch all messages for this conversation
        ChatService.getAllMessages(conversationId)
          .then((messages) => {
            console.log('Fetched messages:', messages.messages);
            // Update message list with fetched data
            $scope.messages = messages.messages;
            // Ensure messages are shown in correct order
            $scope.messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            // Scroll to latest messages
            $scope.scrollToBottom();
          })
          .catch((err) => {
            // Display error notification if message fetch fails
            ToastService.error(`Error fetching messages ${err}`);
          })
          .finally(() => {
            // Reset message loading state
            $scope.messageLoading = false;
            $timeout();
          });
      };
      

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
        // Get the ID of the active conversation
        const conversationId = $scope.selectedConversation._id;
        
        // Validate conversation is selected
        if (!$scope.selectedConversation) {
          ToastService.error("Please select a conversation first");
          return;
        }
        
        // Validate that message has content (text or image)
        if ($scope.inputMessage.trim() === "" && !$scope.image) {
          return;
        }
          
        // Create message object with text content and sender info
        const messageObj = {
          message: $scope.inputMessage.trim(),
          sender: {
            username: $scope.loggedInUser.username
          },
          conversation: conversationId,
          createdAt: new Date()
        };

        // Create FormData object for sending mixed content (text + files)
        const formData = new FormData();
        
        // Add text message to form data if present
        if (messageObj.message) {
          formData.append("message", messageObj.message);
        }

        // Add image attachment if present
        if ($scope.image) {
          formData.append("image", $scope.image);
          messageObj.image = URL.createObjectURL($scope.image); // Create temporary URL for preview
        }

        // Add message to local array immediately for instant feedback
        $scope.scrollToBottom();

        // Clear inputs immediately for better UX
        const currentMessage = $scope.inputMessage;
        const currentImage = $scope.image;
        $scope.inputMessage = "";
        $scope.image = undefined;

        // Send message to server
        ChatService.addMessage(formData, conversationId)
          .then((res) => {
            console.log('Message sent successfully:', res);
            $scope.scrollToBottom();
          })
          .catch((error) => {
            ToastService.error(`Error sending message: ${error}`);
          })
          .finally(() => {
            $timeout();
          });
      };
      
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
