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
                    
                     $rootScope.isLogged = true; 
                     res.isSeller ? $rootScope.isSeller = true : $rootScope.isSeller = false;
                     res.isAdmin ? $rootScope.adminLogged = true : $rootScope.adminLogged = false;
                    $state.go("home");
            })
            .catch(function(error) {
                ToastService.error(`error in login ${error}`);
            });
    };
});