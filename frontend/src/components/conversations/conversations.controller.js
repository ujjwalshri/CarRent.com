angular.module('myApp').controller('conversationsCtrl', function($scope, $stateParams, IDB, $timeout, BackButton) {
    $scope.back = BackButton.back; // back function to go back to the previous page
    /* 
    variable declaration
    */
    $scope.myConversations = []; //  array to hold all the conversations of the user
    $scope.messages = []; // array to hold all the messages of a particular conversation
    $scope.selectedConversation = null; // object to hold the selected conversation
    const loggedInUser = JSON.parse(sessionStorage.getItem("user")); // getting the logged in user
     $scope.loggedUser = loggedInUser.username; // for handling the view logic 
    $scope.images = []; // array to hold the images
    $scope.inputMessage = ""; // input message


   /*
    Function to initialize the controller and fetch all the conversations of the user
    @params none
    @returns none
    */
    $scope.init = ()=>{
        if($stateParams.id == 0){ // if the stateParams.id is 0, fetch all conversations for the user
            IDB.getUserConversations(loggedInUser.id).then((conversations) => {
                $scope.myConversations = conversations; // set the myConversations to all the conversations fetched from the database
                console.log($scope.myConversations);
            }).catch((err) => {
                ToastService.error(`Error fetching conversations ${err}`); // show error message if there is an error
            });
        } else { // else fetch all conversations for the user where the car id is equal to the stateParams.id
            IDB.getUserConversations(loggedInUser.id).then((conversations) => {
                $scope.myConversations = conversations.filter(conversation => conversation.car.id === $stateParams.id); // set the myConversations to all the conversations fetched from the database where the car id is equal to the stateParams.id
            }).catch((err) => {
                ToastService.error(`Error fetching conversations ${err}`); // show error message if there is an error
            });
        }
    }


    

    // Fetch messages for a selected conversation
    $scope.fetchMessages = (conversationId) => {
        IDB.getMessagesAtConversationID(conversationId).then((messages) => { // get messages at a particular conversationId
            console.log(conversationId);
            $scope.messages = messages; // set the messages to the messages fetched from the database
            console.log($scope.messages);
            $scope.selectedConversation = $scope.myConversations.find(conversation => conversation.id === conversationId); // set the selected conversation to the conversation with the conversationId
        }).catch((err) => {
           ToastService.error(`Error fetching messages ${err}`); // show error message if there is an error
        });
    };

    // Function to handle image preview and Base64 conversion
    $scope.previewImages = function (input) {
        if (input.files) {
          let files = Array.from(input.files); // Convert FileList to an array
          let totalFiles = files.length;
          let processedFiles = 0;
      
          files.forEach((file) => {
            let reader = new FileReader();// making new instance of FileReader
            reader.readAsDataURL(file); // read the file as data url which means converting it basically into the base64 format
            
            reader.onload = function (e) {  // onload event is triggered when the file is read
           
              $scope.images.push({ file: file, base64: e.target.result }); // pushing the file and the base64 data into the images array
              processedFiles++;
          
              console.log("Image added:", file.name);
              
              if (processedFiles === totalFiles) { // if all the files are processed then log the images array
                console.log("All images processed:", $scope.images);
              }
              $timeout(); // timeout is used to update the view
            };
          });
        }
      };
    
    $scope.checkEnter = function(event) {
        if (event.keyCode === 13) { // Enter key code
            event.preventDefault(); // Prevent the default form submission
            $scope.sendMessage(); // Call the sendMessage function
        }
    };



   // function to add a message into the database with a particular conversation id
$scope.sendMessage = () => {
    $scope.images = $scope.images.map(image => image.base64) // Convert images to base64 strings
    if($scope.inputMessage.trim() === "" && $scope.images.length === 0) return; // Return if the message is empty and there are no images
    const message = {
        message: $scope.inputMessage.trim(), // Trim the message
        sender: loggedInUser.username, // Set the sender to the logged in user
        receiver: $scope.selectedConversation.receiver, // Set the receiver to the selected conversation receiver
        conversation: $scope.selectedConversation, // Set the conversation to the selected conversation
        createdAt: new Date() //  Set the createdAt to the current date
    };

    if ($scope.images.length > 0) {
        message.images = $scope.images; // Add images to the message if there are any
    }
    // Add the message to the database
    IDB.addMessage(message).then((response) => {
        $scope.messages.push(message);
        $scope.inputMessage = ""; // Reset input message after sending the message
        $scope.images = []; // Reset images after sending the message
    }).catch((error) => {
        ToastService.error(`Error adding message ${error}`); // Show error message if there is an error
    });
};
});