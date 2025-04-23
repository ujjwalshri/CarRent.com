angular.module("myApp").controller("adminCtrl", function($scope, $state, $rootScope, AuthService, ToastService) {

    // Initialize the collapsed state
    $scope.isNavCollapsed = true;

    // function to logout the admin
    $scope.adminLogout = function() {
        AuthService.logout()
            .then(function(res) {
                $rootScope.isLogged = false;
                $rootScope.adminLogged = false;
            })
            .catch(function(err) {
              ToastService.error("Logout error:", err);
            });
    };

});