angular.module("myApp").controller("loginCtrl", function($scope, $state, $rootScope, AuthService, ToastService) {
    $scope.username = "";
    $scope.password = "";

    $scope.login = function() {
        // Add any additional validation if needed
        if (!$scope.username || !$scope.password) {
            alert("Please enter username and password");
            return;
        }  
       // calling auth service to loginUser user
        AuthService.loginUser($scope.username, $scope.password)
            .then(function(res) {
                    ToastService.success("Logged in successfully");
                    // $rootScope.adminLogged = JSON.parse(sessionStorage.getItem("user")).role !==undefined;
                     $rootScope.isLogged = true; 
                    // $rootScope.isSeller = JSON.parse(sessionStorage.getItem("user")).isSeller; // setting the rootScope of isSeller to true if the user is a seller
                    $state.go("home");
            })
            .catch(function(error) {
                ToastService.error(`error in login ${error}`);
            });
    };
});