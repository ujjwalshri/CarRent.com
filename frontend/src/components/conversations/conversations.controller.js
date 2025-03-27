angular
  .module("myApp")
  .controller(
    "conversationsCtrl",
    function (
      $scope,
      $stateParams,
      IDB,
      $timeout,
      BackButton,
      RouteProtection,
      ChatService,
      $q,
      ToastService,
      $timeout
    ) {
      $scope.back = BackButton.back; // back function to go back to the previous page,
      $scope.myConversations = []; //  array to hold all the conversations of the user
      $scope.messages = []; // array to hold all the messages of a particular conversation
      $scope.selectedConversation = null; // object to hold the selected conversation
      $scope.isLoading = false;
      $scope.messageLoading = false;

     
      // for handling the view logic

      $scope.inputMessage = ""; // input message
      $scope.loggedInUser = null; // logged in user
      $scope.image; // array to hold the images
      let socket = null;

      /*
    Function to initialize the controller and fetch all the conversations of the user
    @params none
    @returns none
    */
      $scope.init = () => {
        socket = io("http://localhost:8000"); // initialize the socket connection
        
        socket.on("newMessage", (message) => {
            console.log(message);
            $scope.messages.push(message);
            $scope.scrollToBottom();
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
        $scope.isLoading = true;
        $q.all([
          RouteProtection.getLoggedinUser(),
          $stateParams.id == 0
            ? ChatService.getAllConversations()
            : ChatService.getConversationsAtCarId($stateParams.id),
        ])
          .then(([user, conversations]) => {
            $scope.loggedInUser = user;
            $scope.myConversations = conversations.conversations;
            console.log($scope.myConversations);
          })
          .catch((err) => {
            ToastService.error(`Error fetching user ${err.data.message}`); // show error message if there is an error
          }).finally(()=>{
            $scope.isLoading = false;
          });

        $scope.$on("$destroy", function () {
          if (socket) {
            socket.disconnect();
          }
        });
      };
     /*
    Function to scroll to the bottom of the chat box
    @params none
    @returns none
    */
      $scope.scrollToBottom = function () {
        $timeout(function () {
          var chatBox = document.getElementById("chatBox");
          if (chatBox) {
            chatBox.scrollTop = chatBox.scrollHeight;
          }
        }, 100); // Timeout ensures it runs after the DOM updates
      };

      // Fetch messages for a selected conversation
      $scope.fetchMessages = (conversationId) => {
        messageLoading = true;
        $scope.scrollToBottom();
        
        $scope.selectedConversation = $scope.myConversations.find(
            (conversation) => conversation._id === conversationId
        );
         
        socket.emit("joinedConversation", $scope.selectedConversation._id); // emit the joinedConversation event with the conversation id
        ChatService.getAllMessages(conversationId)
          .then((messages) => {
            console.log(messages.messages);
            $scope.messages = messages.messages; // set the messages to the messages fetched from the database
          })
          .catch((err) => {
            ToastService.error(`Error fetching messages ${err}`); // show error message if there is an error
          }).finally(()=>{
            $scope.messageLoading = false;
          })
      };

      // Function to handle image preview
      $scope.previewImages = function (input) {
        console.log(input);
        if (input.files) {
          console.log(input.files);
          
          $scope.image = input.files[0]; // Store the files directly
          $timeout();
         
        }
      };
     // Function to check if the enter key is pressed
      $scope.checkEnter = function (event) {
        if (event.keyCode === 13) {
          // Enter key code
          event.preventDefault(); // Prevent the default form submission
          $scope.sendMessage(); // Call the sendMessage function
        }
      };

      // function to add a message into the database with a particular conversation id
      $scope.sendMessage = () => {
        console.log($scope.image); 
        const conversationId = $scope.selectedConversation._id; // Get the conversation id
        if ($scope.inputMessage.trim() === "" && $scope.image===undefined)
          return; // Return if the message is empty and there are no images
        const message = {
          message: $scope.inputMessage.trim(), // Trim the message
        };

        const formData = new FormData(); // Create a new FormData object
        formData.append("message", message.message); // Append the message to the FormData object

        if ($scope.image) {
           formData.append("image", $scope.image); // Append the images to the FormData object
        }
        console.log($scope.image);

       
        // Add the message to the database
        ChatService.addMessage(formData, conversationId)
          .then((res) => {
            $scope.inputMessage = ""; // Reset input message after sending the message
            $scope.images = []; // Reset images after sending the message
            $scope.scrollToBottom(); // Scroll to the bottom of the chat box
          })
          .catch((error) => {
            ToastService.error(`Error adding message ${error}`); // Show error message if there is an error
          });
      };
    }
  );
