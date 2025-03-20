const app = angular.module("myApp", ["ui.router", "ui.bootstrap"]);
app.controller("appCtrl", function($scope,$rootScope, ToastService,AuthService, RouteProtection) {
    //init function to run when the app first loads
    
    
    
    $scope.init = async function() {
        
       $rootScope.adminLogged  = false; // set the adminLogged to false initially
       $rootScope.isLogged = true; // set the isLogged to false initially
        $rootScope.isSeller = false; // set the isSeller to false initially
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
