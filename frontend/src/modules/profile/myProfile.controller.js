/**
 * My Profile Controller
 * Handles user profile data display, editing, and car management for sellers
 * @module myProfileCtrl
 */
angular.module("myApp").controller("myProfileCtrl", function($scope, $state, ToastService, $uibModal, UserService, CarService, City, $q, $timeout, $stateParams, CarFactory) {

    $scope.isSeller = true;  // Flag to indicate if the user is a seller
    $scope.deleted = false; // Flag to indicate if the user is deleted
    $scope.isLoading = false; // Flag to indicate loading state 
    $scope.loadingProfileData = false;
    $scope.showingSeller = $stateParams.id ? false : true;
    $scope.cities = City.getCities(); // Array to hold city data 
    
    /**
     * Initializes the controller
     * Fetches user profile and car data
     */
    $scope.init = () => {
        fetchProfileData();
    };

    /**
     * Fetches profile data including user details
     */
    function fetchProfileData() {
        $scope.loadingProfileData = true;

        let promise;
        promise = UserService.getUserProfile();
        
        promise.then((result) => {
            if($stateParams.id) {
                $scope.user = result.user;
            } else {
                $scope.user = result.data;
            }
        }).catch((err) => {
            ToastService.error("Error fetching the profile data" + err);
        }).finally(() => {
            $scope.loadingProfileData = false;
        });
    }
  
    /**
     * goes to the become seller page
     */
    $scope.navigate = () => {
        $state.go('becomeSeller');
    }
    

});