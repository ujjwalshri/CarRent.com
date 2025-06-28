/**
 * Home Controller - Main controller for the application landing page
 */
angular.module("myApp").controller("homeCtrl", function($scope, $state) {
    /**
     * function to initialize the controller
     */

    $scope.navigateToCars = function(){
        console.log("Navigating to exploreCars");
        $state.go('exploreCars');
    }


    $scope.init = function() {
        // Any future initialization can go here
    };
});