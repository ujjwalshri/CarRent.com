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
                $scope.updateUser = $scope.user;
            }
        }).catch((err) => {
            ToastService.error("Error fetching the profile data" + err);
        }).finally(() => {
            $scope.loadingProfileData = false;
        });
    }
  
    /**
     * Navigates to car listing page
     */
    $scope.navigate = () => {
        $state.go('car');
    }
    
    /**
     * Navigates to seller listings page
     */
    $scope.goToSellerListings = () => {
        $state.go('sellerListings');
    }
    
    /**
     * Opens modal for updating user profile information
     */
    $scope.openUpdateModal = () => {
        var modalInstance = $uibModal.open({
            templateUrl: 'updateUserModal.html',
            controller: function($scope, $uibModalInstance, userData, UserService, ToastService, UserFactory) {
                $scope.updatedUser = angular.copy(userData); // creating a deep copy of the user data
                $scope.cities = City.getCities();
                
                /**
                 * Closes the modal without saving
                 */
                $scope.cancel = function() {
                    $uibModalInstance.dismiss('cancel');
                };
                
                /**
                 * Saves user profile updates
                 * Validates form data before submitting
                 */
                $scope.saveUser = function() {
                    const data = {
                        firstName: $scope.updatedUser.firstName,
                        lastName: $scope.updatedUser.lastName,
                        city: $scope.updatedUser.city
                    };

                   const validateionResult = UserFactory.validateUpdateUserData(data);
                   if(validateionResult !== true){
                        ToastService.error(validateionResult);
                        return;
                    }
                    
                    UserService.updateUserProfile(data)
                        .then(function(response) {
                            ToastService.success("User profile updated successfully");
                            $uibModalInstance.close(response.data.user);
                        })
                        .catch(function(err) {
                            ToastService.error("Error updating user profile: " + err);
                        });
                };
            },
            resolve: {
                userData: function() {
                    return $scope.user;
                }
            }
        });
        
        modalInstance.result.then(function(updatedUser) {
            $scope.user = updatedUser;
        }, function() {
            console.log('Modal dismissed');
        });
    };
});