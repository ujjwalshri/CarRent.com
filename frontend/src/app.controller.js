const app = angular.module("myApp", ["ui.router", "ui.bootstrap"]);
app.controller("appCtrl", function($scope, $rootScope, ToastService, AuthService, AuthService, SocketService) {
    /**
     * Initializes the application
     * Fetches the logged-in user and updates the root scope
     * Sets up socket connection and event handlers
     * @returns {Promise<void>}
     */
    $scope.init = async function() {
        AuthService.getLoggedinUser().then((user)=>{
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
     * Sets up socket event listeners
     * @returns {void}
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

  
});
