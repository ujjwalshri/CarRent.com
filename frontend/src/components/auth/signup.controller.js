app.controller("signupCtrl", function ($scope, $state, AuthService, ToastService, $rootScope, UserFactory, City, SocketService) {

  /**
   * Initializes the signup controller
   * Fetches all the cities and sets them in the scope
   * @returns {Promise<void>}
   */
  $scope.init = function(){
    $scope.isSubmit = false; // variable to hold the submit state of the singup form
    $scope.cities = City.getCities(); // Fetch all the cities
    $scope.showVerificationMessage = false; // variable to control verification message visibility
    $scope.userEmail = ''; // store user email for verification message
    $scope.showPassword = false; // variable to control password visibility
    $scope.showConfirmPassword = false; // variable to control confirm password visibility
    
    // Initialize form variables
    $scope.formData = {
      firstName: '',
      lastName: '',
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
      city: '',
      adhaar: ''
    };
  }

  /**
   * Signs up a new user
   * Creates a user object using the UserFactory template
   * Validates the user object and registers the user
   * @returns {Promise<void>}
   */
  $scope.signup = function () {
    $scope.isLoading = true;
    // creating the user object using the UserFactory template
    let user = UserFactory.create({
      firstName: $scope.formData.firstName,
      lastName: $scope.formData.lastName,
      email: $scope.formData.email,
      username: $scope.formData.username,
      password: $scope.formData.password,
      confirmPassword: $scope.formData.confirmPassword,
      city: $scope.formData.city,
      adhaar: $scope.formData.adhaar
    });
    
    // function to validate the user object and then making sure that we register the user
    if(typeof user === "string"){
      ToastService.error(user);
      return;
    }
    
    AuthService.registerUser(user)
      .then(function(response) {
        $scope.isSubmit = true;
        $scope.showVerificationMessage = true;
        $scope.userEmail = user.email;
        
        const socket = SocketService.getSocket();
        if (socket) {
          // Force socket to join room and set user online
          socket.emit('joinUserRoom', user.username);
          socket.emit('userOnline', user.username);
          socket.emit('getOnlineUsers');
        }
      })
      .catch(function(error) {
        ToastService.error(`${error}`);
      })
      .finally(()=>{
        $scope.isLoading = false;
      })
  };
});