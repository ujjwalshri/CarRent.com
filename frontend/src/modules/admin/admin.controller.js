angular.module("myApp").controller("adminCtrl", function($scope, $rootScope, AuthService, ToastService) {

    // Initialize the collapsed state
    $scope.isNavCollapsed = true;

    /**
     * Logs out the currently logged in admin user by calling AuthService.logout()
     * Updates the global authentication states ($rootScope.isLogged and $rootScope.adminLogged)
     * to false after successful logout
     * Shows an error toast notification if logout fails
     * 
     * @function adminLogout
     * @memberof adminCtrl
     * @returns {Promise} Promise that resolves after successful logout or rejects with error
     */
    $scope.adminLogout = function() {
        AuthService.logout()
            .then(function() {
                $rootScope.isLogged = false;
                $rootScope.adminLogged = false;
            })
            .catch(function(err) {
              ToastService.error("Logout error:", err);
            });
    };

});