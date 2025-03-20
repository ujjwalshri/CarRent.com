const app = angular.module("myApp", ["ui.router", "ui.bootstrap"]);
app.controller("appCtrl", function($scope,$rootScope, ToastService,AuthService, RouteProtection) {
    //init function to run when the app first loads
    const loggedInUser = RouteProtection.getMe; // get the loggedInUser
    $scope.init = function() {
       $rootScope.adminLogged  = loggedInUser.isAdmin; // set the adminLogged to false initially
       $rootScope.isLogged = loggedInUser; // set the isLogged to false initially
        $rootScope.isSeller = loggedInUser.isSeller; // set the isSeller to false initially
    };

    //logout function to remove the user from the session storage
    $scope.logout = () => {  
        AuthService.logout().then((res) => {
            ToastService.success("Logged out successfully");
            $rootScope.isLogged = false;
        }).catch((err)=>{
            ToastService.error("Error logging out");
        })
    };
});
