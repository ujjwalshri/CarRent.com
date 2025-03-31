
app.controller("signupCtrl", function ($scope, $state, AuthService, ToastService, $rootScope, UserFactory,City ) {
   /*
   function to singup the user
    @params none
    @returns none
   */
  $scope.cities = City.getCities(); // Fetch all the cities
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
        $rootScope.isLogged = true; 
        $state.go("login"); 
      })
      .catch(function(error) {
        ToastService.error(`error ${error}`);
      });
  };
});