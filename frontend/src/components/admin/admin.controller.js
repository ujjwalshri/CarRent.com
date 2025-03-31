angular.module("myApp").controller("adminCtrl", function($scope, $state, $rootScope, AuthService) {
    // Initialize with explicit $scope variables

    // Initialize the collapsed state
    $scope.isNavCollapsed = true;

    // function to logout the admin
    $scope.adminLogout = function() {
        AuthService.logout()
            .then(function(res) {
                $state.go("login");
                $rootScope.isLogged = false;
                $rootScope.adminLogged = false;
            })
            .catch(function(err) {
                console.error("Logout error:", err);
            });
    };
    


});