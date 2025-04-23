const app = angular.module("myApp", ["ui.router", "ui.bootstrap"]);
app.controller("appCtrl", function($scope, $rootScope, ToastService, AuthService, RouteProtection, SocketService) {
    /**
     * Initializes the application
     * Fetches the logged-in user and updates the root scope
     * Sets up socket connection and event handlers
     * @returns {Promise<void>}
     */
    $scope.init = async function() {
        RouteProtection.getLoggedinUser().then((user)=>{
            $rootScope.isLogged = true;
            if(user.isAdmin){
                $rootScope.adminLogged = true;
            }
            if(user.isSeller){
                $rootScope.isSeller = true;
            }
            
            // Initialize socket connection with user data
            SocketService.initialize(user);
            
            // Join user's personal notification room
            SocketService.joinUserRoom();
            
            // Setup global socket event handlers
            setupSocketEvents();
            
        }).catch((err)=>{
            $rootScope.isLogged = false;
        })
    };

    /**
     * Setup socket event handlers for global notifications
     */
    const setupSocketEvents = function() {
        // Listen for bid success notifications
        SocketService.on('bidSuccess', function(bidData) {
            // Show success toast with bid details
            ToastService.success(`Bid placed successfully on ${bidData.carName}`);
        });
        SocketService.on('bidSuccess', function() {
            ToastService.success("Thank you for trusting us with your money");
        });
       
    };

    /**
     * Logs out the current user
     * removes the user cookie and sets isLogged to false
     * @returns {Promise<void>}
     */
    $scope.logout = () => {  
        AuthService.logout().then((res) => {
            // Disconnect socket before logout
            SocketService.disconnect();
            
            ToastService.success("Logged out successfully");
            $rootScope.isLogged = false;

        }).catch((err)=>{
            ToastService.error("Error logging out");
        })
    };
});
