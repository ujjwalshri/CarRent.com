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
      $uibModal,
      $document
    ) {

      $scope.myConversations = []; // List of user's active conversations
      $scope.messages = []; // Messages for currently selected conversation
      $scope.onlineUsers = []; // Users currently active in the system
      

      $scope.selectedConversation = null; // Currently selected/active conversation
      $scope.isLoading = false; // Main content loading state
      $scope.messageLoading = false; // Message loading state
      $scope.isSendingMessage = false; // Message sending state


      $scope.search = {
        searchQuery: "", // Search query for filtering conversations
        searchTime: 300, // Debounce time for search input
      }

      $scope.carId = $stateParams.id; // Car ID for filtering conversations
      

      $scope.inputMessage = ""; // Current message being composed
      $scope.loggedInUser = null; // Current user's profile
      $scope.image; // Image attachment for current message
      
      // Initialize dragging state
      $scope.isDragging = false;
      $scope.startX = 0;
      $scope.startWidth = 0;
      $scope.minWidth = 280;
      $scope.maxWidth = 0;

      // Function to update the max width based on container size
      function updateMaxWidth() {
        const container = document.querySelector('.resizable-panels');
        if (container) {
          const containerWidth = container.offsetWidth;
          $scope.maxWidth = Math.min(containerWidth * 0.6, containerWidth - 400);
        }
      }

      // Document-level event handlers for dragging
      const mouseMoveHandler = function(e) {
        if (!$scope.isDragging) return;

        const leftPanel = document.getElementById('leftPanel');
        if (!leftPanel) return;

        const width = $scope.startWidth + (e.pageX - $scope.startX);
        
        if (width >= $scope.minWidth && width <= $scope.maxWidth) {
          leftPanel.style.width = width + 'px';
          $scope.$apply();
        }
      };

      const mouseUpHandler = function() {
        if (!$scope.isDragging) return;
        
        $scope.isDragging = false;
        document.body.classList.remove('dragging-active');
        $scope.$apply();
      };

      // Start dragging
      $scope.startDragging = function($event) {
        const leftPanel = document.getElementById('leftPanel');
        if (!leftPanel) return;
        
        $scope.isDragging = true;
        $scope.startX = $event.pageX;
        $scope.startWidth = leftPanel.offsetWidth;
        
        // Add dragging class to body
        document.body.classList.add('dragging-active');
        
        // Update maxWidth when starting to drag
        updateMaxWidth();
      };

      // Add document-level event listeners
      $document.on('mousemove', mouseMoveHandler);
      $document.on('mouseup', mouseUpHandler);
      $document.on('mouseleave', mouseUpHandler);

      // Handle window resize
      angular.element(window).on('resize', function() {
        updateMaxWidth();
        
        const leftPanel = document.getElementById('leftPanel');
        if (!leftPanel) return;

        const currentWidth = leftPanel.offsetWidth;
        if (currentWidth > $scope.maxWidth) {
          leftPanel.style.width = $scope.maxWidth + 'px';
          $scope.$apply();
        }
      });

      // Function to initialize the controller
      // Fetches user data and conversations
      $scope.init = () => {
        $scope.isLoading = true;
        $q.all([
          AuthService.getLoggedinUser(),
          $stateParams.id
            ? ChatService.getConversationsAtCarId($stateParams.id)
            :  ChatService.getAllConversations($scope.searchQuery),
        ])
          .then(([user, conversationsData]) => {

            $scope.loggedInUser = user;
            $scope.myConversations = conversationsData.conversations;
          
            SocketService.initialize(user);
          
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


            SocketService.joinUserRoom($scope.loggedInUser.username);

            SocketService.getOnlineUsers();
          })
          .catch((err) => {
            ToastService.error(`Error fetching user ${err.data.message}`);
          })
          .finally(() => {
            $scope.isLoading = false;
          });
      };


      $scope.$on("$destroy", function () {
        // Remove document-level event listeners
        $document.off('mousemove', mouseMoveHandler);
        $document.off('mouseup', mouseUpHandler);
        $document.off('mouseleave', mouseUpHandler);
        
        // Remove window resize listener
        angular.element(window).off('resize');
        
        // Clean up socket listeners
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
      $scope.fetchMessages = (conversationId) => {
        $scope.messageLoading = true;
        
        $scope.messages = [];
      
        $scope.selectedConversation = $scope.myConversations.find(
            (conversation) => conversation._id === conversationId
        );
        
        if (!$scope.selectedConversation) {
          ToastService.error("Conversation not found");
          $scope.messageLoading = false;
          return;
        }
         
        SocketService.joinConversation($scope.selectedConversation._id);
      
        ChatService.getAllMessages(conversationId)
          .then((messages) => {
            $scope.messages = messages.messages;
            console.log('Fetched messages:', $scope.messages[0]);
            $scope.scrollToBottom();
          })
          .catch((err) => {
            ToastService.error(`Error fetching messages ${err}`);
          })
          .finally(() => {
            $scope.messageLoading = false;
            $timeout();
          });
      };
      

      // Handles image file selection and preview
      // Called when user selects an image file to attach
      $scope.previewImages = function (input) {
        if (input.files) {
          $scope.image = input.files[0];
          $timeout();
        }
        input.value = null;
      };
      
      // Monitors keyboard input for Enter key press
      // Allows sending messages with Enter key
      $scope.checkEnter = function (event) {
        if (event.keyCode === 13) { 

          event.preventDefault();
          $scope.sendMessage();
        }
      };

      // Sends the current message with any attachments
      // Called when user clicks send or presses Enter
      $scope.sendMessage = () => {
        const conversationId = $scope.selectedConversation._id;
        

        if (!$scope.selectedConversation) {
          ToastService.error("Please select a conversation first");
          return;
        }
        
        // Validate that message has content (text or image)
        if ($scope.inputMessage.trim() === "" && !$scope.image) {
          return;
        }
        
        const formData = new FormData();
        
        if ($scope.inputMessage.trim()) {
          formData.append("message", $scope.inputMessage.trim());
        }

        if ($scope.image) {
          formData.append("image", $scope.image);
        }


        const tempMessage = $scope.inputMessage;
        const tempImage = $scope.image;
        $scope.inputMessage = "";
        $scope.image = undefined;


        ChatService.addMessage(formData, conversationId)
          .then((res) => {
            $scope.scrollToBottom();
          })
          .catch((error) => {
            $scope.inputMessage = tempMessage;
            $scope.image = tempImage;
            ToastService.error(`Error sending message: ${error}`);
          })
          .finally(() => {
            $timeout();
          });
      };


      $scope.searchConversations = function() {
        $timeout.cancel($scope.searchTimeout);
        // Create a new timeout to execute the search after 300ms
        $scope.searchTimeout = $timeout(() => {
          ChatService.getAllConversations($scope.search.searchQuery)
            .then((response) => {
              // Update conversation list with search results
              $scope.myConversations = response.conversations;
            })
            .catch((err) => {
              ToastService.error(`Error fetching conversations: ${err}`);
            });
        }, 300);
      }

      
      // Determines if the other user in a conversation is currently online
      // Used to display online status indicators in conversation list
      $scope.isUserOnline = function(conversation) {

        if (!conversation || !$scope.onlineUsers || !$scope.loggedInUser) {
          return false;
        }
        
        const otherUserName = conversation.reciever.username === $scope.loggedInUser.username ? 
          conversation.creator.username : conversation.reciever.username;
          
        return $scope.onlineUsers.includes(otherUserName);
      };

      $scope.openImagesModal = () => {
        if (!$scope.selectedConversation) {
          ToastService.error("Please select a conversation first");
          return;
        }

        const modalInstance = $uibModal.open({
          templateUrl: 'imagesModal.html',
          controller: function($scope, $uibModalInstance, conversationId, ChatService, ToastService) {
            $scope.isLoading = true;
            $scope.images = [];
        
            $scope.close = function() {
              $uibModalInstance.dismiss('cancel');
            };
        
            // Load images when modal opens
            ChatService.getAllAttachments(conversationId)
              .then((response) => {
                $scope.images = response.attachments;
              })
              .catch((err) => {
                ToastService.error("Error loading images: " + err);
              })
              .finally(() => {
                $scope.isLoading = false;
              });
          },
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


