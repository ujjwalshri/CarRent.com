angular.module("myApp").controller("loginCtrl", function($scope, $state, $rootScope, AuthService, ToastService, SocketService, UserFactory) {
    $scope.username = ""; // variable to hold the username
    $scope.password = ""; // variable to hold the password
    $scope.showPassword = false; // variable to control password visibility
   
    /**
     * Logs in a user
     * Validates the user input and logs in the user
     * @returns {Promise<void>}
     */
    $scope.login = function() {
        // Add any additional validation if needed
       if(UserFactory.validateLoginData($scope.username, $scope.password) !== true){
            ToastService.error("Invalid username or password");
            return;
        }
       // calling auth service to loginUser user
        AuthService.loginUser($scope.username, $scope.password)
            .then(function(user) {
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
                
                // Emit login event to update navbar
                $rootScope.$emit('user:loggedIn', user);
                
                // Show success message and redirect
                ToastService.success("Logged in successfully");
                if(user.isAdmin){
                    $state.go("admin");
                }
                else{
                    $state.go("home");
                }
            })
            .catch(function(error) {
                ToastService.error(error);
            });
    };
});