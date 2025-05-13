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


      $scope.search = {
        searchQuery: "", // Search query for filtering conversations
        searchTime: 300, // Debounce time for search input
      }

      $scope.carId = $stateParams.id; // Car ID for filtering conversations
      

      $scope.inputMessage = ""; // Current message being composed
      $scope.loggedInUser = null; // Current user's profile
      $scope.image; // Image attachment for current message
      

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
