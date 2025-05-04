app.controller("signupCtrl", function ($scope, $state, AuthService, ToastService, $rootScope, UserFactory, City, SocketService, $timeout, $interval) {

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
    $scope.resendDisabled = false; // variable to control resend button state
    $scope.cooldownTime = 30; // cooldown time for resend button
    
    
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


  $scope.resendVerificationEmail = function() {
    if ($scope.resendDisabled) {
      return;
    }
    
    $scope.resendDisabled = true;
    $scope.cooldownTime = 30;

    const timer = $interval(() => {
      $scope.cooldownTime--;
      if ($scope.cooldownTime <= 0) {
        $interval.cancel(timer);
        $scope.resendDisabled = false;
      }
    }, 1000);
    
    AuthService.resendVerificationEmail($scope.userEmail)
      .then(function() {
        ToastService.success("Verification email sent successfully");
      })
      .catch(function(error) {
        ToastService.error(`${error}`);
      });
  }

  /**
   * Signs up a new user
   * Creates a user object using the UserFactory template
   * Validates the user object and registers the user
   * @returns {Promise<void>}
   */
  $scope.signup = function () {
    $scope.isLoading = true;
    // creating a validated user object using the UserFactory
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
    
     // if user is a string, it means there is an error in the user validation
    if(typeof user === "string"){
      ToastService.error(user);
      $scope.isLoading = false;
      return;
    }
    
    AuthService.registerUser(user)
      .then(function() {
        $scope.isSubmit = true;
        $scope.showVerificationMessage = true;
        $scope.userEmail = user.email;
        
        const socket = SocketService.getSocket();
        if (socket) {
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