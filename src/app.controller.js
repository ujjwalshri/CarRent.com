const app = angular.module("myApp", ["ui.router", "ui.bootstrap"]);
app.controller("appCtrl", function($scope,$rootScope, ToastService) {
    //init function to run when the app first loads
    $scope.init = function() {
       $rootScope.adminLogged  = false; // set the adminLogged to false initially
       $rootScope.isLogged = false; // set the isLogged to false initially
        $rootScope.isSeller = false; // set the isSeller to false initially
            const loggedInUser = JSON.parse(sessionStorage.getItem("user"));// fetch the loggedInUser
            $rootScope.adminLogged = loggedInUser && loggedInUser.role === "admin"; // check if the user is admin
            $rootScope.isSeller = loggedInUser && loggedInUser.isSeller === true; // check if the user is seller
            $rootScope.isLogged = loggedInUser; // check if the user is logged in
    };

    //logout function to remove the user from the session storage
    $scope.logout = () => {  
        sessionStorage.removeItem("user"); // remove the user from the session storage
        $rootScope.isLogged = false; // set the isLogged to false
        ToastService.success("Logged out successfully"); // show the success message
    };
});
