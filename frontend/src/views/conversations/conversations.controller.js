angular
  .module("myApp")
  .controller(
    "conversationsCtrl",
    function (
      $scope,
      $stateParams,
      $timeout,
      AuthService,
      ChatService,
      SocketService,
      $q,
      ToastService,
      $timeout,
      $uibModal
    ) {

      $scope.myConversations = []; // List of user's active conversations
      $scope.messages = []; // Messages for currently selected conversation
      $scope.onlineUsers = []; // Users currently active in the system
      

      $scope.selectedConversation = null; // Currently selected/active conversation
      $scope.isLoading = false; // Main content loading state
      $scope.messageLoading = false; // Message loading state
      $scope.isSendingMessage = false; // Message sending state
      

      $scope.inputMessage = ""; // Current message being composed
      $scope.loggedInUser = null; // Current user's profile
      $scope.image; // Image attachment for current message
      

      $scope.init = () => {
        // Begin loading sequence
        $scope.isLoading = true;
        
        // Execute parallel API requests first
        $q.all([
          AuthService.getLoggedinUser(),
          $stateParams.id
            ? ChatService.getConversationsAtCarId($stateParams.id)
            :  ChatService.getAllConversations(),
        ])
          .then(([user, conversationsData]) => {
            // Store user data and conversation list
            $scope.loggedInUser = user;
            $scope.myConversations = conversationsData.conversations;
            
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
                conversation.creator._id === $scope.loggedInUser._id ||
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
      });
      
      // Scrolls the chat box to display the most recent messages
      // Called after new messages are added or conversation changes
      $scope.scrollToBottom = function () {
        $timeout(function () {
          var chatBox = document.getElementById("chatBox");
          if (chatBox) {
            chatBox.scrollTop = chatBox.scrollHeight;
          }
        }); 
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
            // Update message list with fetched data
            $scope.messages = messages.messages;
            console.log('Fetched messages:', $scope.messages[0]);
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
        if (input.files) {

          
          // Store selected image file for upload
          $scope.image = input.files[0];
          
          // Trigger digest cycle to update the $scope.image state
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
        


          
        // Create FormData object for sending mixed content (text + files)
        const formData = new FormData();
        
        // Add text message to form data if present
        if ($scope.inputMessage.trim()) {
          formData.append("message", $scope.inputMessage.trim());
        }
        // Add image attachment if present
        if ($scope.image) {
          formData.append("image", $scope.image);
        }

        // Clear input fields before sending
        const tempMessage = $scope.inputMessage;
        const tempImage = $scope.image;
        $scope.inputMessage = "";
        $scope.image = undefined;

        // Send message to server
        ChatService.addMessage(formData, conversationId)
          .then((res) => {
            $scope.scrollToBottom();
          })
          .catch((error) => {
            // Restore input fields if sending fails
            $scope.inputMessage = tempMessage;
            $scope.image = tempImage;
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
          conversation.creator.username : conversation.reciever.username;
          
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
  // Images modal controller
  .controller('ImagesModalCtrl', function($scope, $uibModalInstance, conversationId, ChatService, ToastService) {
    $scope.isLoading = true;
    $scope.images = [];

    $scope.close = function() {
      $uibModalInstance.dismiss('cancel');
    };

    // Load images when modal opens
    ChatService.getAllAttachments(conversationId)
      .then((response) => {
        console.log('Fetched images:', response.attachments);
        $scope.images = response.attachments;
      })
      .catch((err) => {
        ToastService.error("Error loading images: " + err);
      })
      .finally(() => {
        $scope.isLoading = false;
      });
  });
