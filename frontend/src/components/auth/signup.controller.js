
app.controller("signupCtrl", function ($scope, $state, AuthService, ToastService, $rootScope, UserFactory,City, SocketService ) {
   
  /**
   * Initializes the signup controller
   * Fetches all the cities and sets them in the scope
   * @returns {Promise<void>}
   */
  $scope.init = function(){
    $scope.cities = City.getCities(); // Fetch all the cities
  }
  /**
   * Signs up a new user
   * Creates a user object using the UserFactory template
   * Validates the user object and registers the user
   * @returns {Promise<void>}
   */
  $scope.signup = function () {
    // creating the user object using the UserFactory template
    let user  = UserFactory.create({firstName: $scope.firstName,lastName: $scope.lastName,email: $scope.email,username: $scope.username,password: $scope.password,confirmPassword: $scope.confirmPassword,city: $scope.city,adhaar: $scope.adhaar});
    // function to validate the user object and then making sure that we register the user
     if(typeof user === "string"){
        ToastService.error(user);
        return;
     }
       AuthService.registerUser(user)
      .then(function() {
        const socket = SocketService.getSocket();
        if (socket) {
            // Force socket to join room and set user online
            socket.emit('joinUserRoom', user.username);
            socket.emit('userOnline', user.username);
            socket.emit('getOnlineUsers');
        }
        $rootScope.isLogged = true; 
        $state.go("login"); 
      })
      .catch(function(error) {
        ToastService.error(`${error}`);
      });
  };
});