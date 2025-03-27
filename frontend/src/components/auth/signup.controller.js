app.controller("signupCtrl", function ($scope, $state, AuthService, ToastService, $rootScope) {
  
   /*
   function to singup the user
    @params none
    @returns none
   */
  $scope.signup = function () {
    // creating the user object
    const user = {
      firstName: $scope.firstName,
      lastName: $scope.lastName,
      email: $scope.email,
      username: $scope.username,
      password: $scope.password,
      confirmPassword: $scope.confirmPassword,
      city: $scope.city,
      adhaar: $scope.adhaar,
    };
    console.log(user);
    // function to validate the user object and then making sure that we register the user
    AuthService.validateUser(user) // calling the validate user function
      .then(function() {
        return AuthService.registerUser(user); // calling the register user function
      })
      .then(function() {
        $rootScope.isLogged = true; // setting the isLogged to true,
        $state.go("login"); // redirecting to the login page
      })
      .catch(function(error) {
        ToastService.error(`error ${error}`); // showing the error message
      });
  };
});