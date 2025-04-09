angular.module("myApp").controller("loginCtrl", function($scope, $state, $rootScope, AuthService, ToastService, SocketService) {
    $scope.username = ""; // variable to hold the username
    $scope.password = ""; // variable to hold the password
   
    /**
     * Logs in a user
     * Validates the user input and logs in the user
     * @returns {Promise<void>}
     */
    $scope.login = function() {
        // Add any additional validation if needed
        if (!$scope.username || !$scope.password) {
            ToastService.error("Please enter username and password");
            return;
        }  
       // calling auth service to loginUser user
        AuthService.loginUser($scope.username, $scope.password)
            .then(function(user) {
                console.log('Login successful:', user);
                
                // Set up root scope flags
                $rootScope.isLogged = true; 
                user.isSeller ? $rootScope.isSeller = true : $rootScope.isSeller = false;
                user.isAdmin ? $rootScope.adminLogged = true : $rootScope.adminLogged = false;
                
                // Get socket instance and explicitly call methods
                const socket = SocketService.getSocket();
                if (socket) {
                    // Force socket to join room and set user online
                    socket.emit('joinUserRoom', user.username);
                    socket.emit('userOnline', user.username);
                    socket.emit('getOnlineUsers');
                }
                
                // Show success message and redirect
                ToastService.success("Logged in successfully");
                $state.go("home");
            })
            .catch(function(error) {
                console.error('Login error:', error);
                ToastService.error(error && error.data ? error.data.err : "Error logging in");
            });
    };
});