/**
 * My Profile Controller
 * Handles user profile data display, editing, and car management for sellers
 * @module myProfileCtrl
 */
angular.module("myApp").controller("myProfileCtrl", function($scope, $state, ToastService, $uibModal, UserService, CarService, City, $q, $timeout) {

    $scope.isSeller = true;  // Flag to indicate if the user is a seller
    $scope.deleted = false; // Flag to indicate if the user is deleted
    
    $scope.userCars = []; // Array to hold user's cars
    $scope.hasMoreCars = true; // Flag to indicate if there are more cars to load 
    $scope.selectedCarPrice = { price: 0 }; // Object to hold selected car price 
    
    $scope.isLoading = false; // Flag to indicate loading state 
    $scope.loadingProfileData = false;
    $scope.activeButton = 'all'; // Active filter button 
    $scope.status; // Filter status for cars (approved, rejected, all)

    $scope.skip = 0; // Pagination offset
    $scope.limit = 10; // Pagination limit 
    
    $scope.cities = City.getCities(); // Array to hold city data 
    
    /**
     * Initializes the controller
     * Fetches user profile and car data
     */
    $scope.init = () => {
        fetchProfileData()
    };

    /**
     * Fetches profile data including user details and cars
     * @param {string} status - Filter status for cars (approved, rejected, all)
     */
    function fetchProfileData(status){
        $scope.isLoading = true;
        $scope.loadingProfileData = true;

        const params = {
            skip: $scope.skip,
            limit: $scope.limit
        }
        
        $q.all([
            UserService.getUserProfile(),
            CarService.fetchUserCars(status ? status : 'all', params),
            CarService.getCurrentPriceRanges()
        ]).then((result)=>{
            $scope.user = result[0].data;
            $scope.updateUser = $scope.user;
            $scope.hasMoreCars = result[1].data.length < $scope.limit ? false : true;
            $scope.skip == 0 
            ? $scope.userCars = result[1].data 
            : $scope.userCars = $scope.userCars.concat(result[1].data);
            $scope.minPrice = result[2][0].min;
            $scope.maxPrice = result[2][0].max;
        }).catch((err)=>{
            ToastService.error("Error fetching the profile data" + err);
        }).finally(()=>{
            $scope.isLoading = false;
            $scope.loadingProfileData = false;
        })
    }
  
    /**
     * Navigates to car listing page
     */
    $scope.navigate = () => {
        $state.go('car');
    }
    
    /**
     * Refreshes the current page to reset all state
     */
    $scope.reset = () => {
        $state.reload();
    }
    
    /**
     * Redirects to detailed view of a specific car
     * @param {string} carID - ID of the car to view
     */
    $scope.redirectToCarPage = (carID) => {
        $state.go("singleCar", { id: carID });
    };
    
    /**
     * Loads additional cars by advancing pagination offset
     * Called when "Load More" is clicked
     */
    $scope.loadMore = () => {
        $scope.skip = $scope.skip + $scope.limit;
        fetchProfileData($scope.status);
    }
    
    /**
     * Filters car list to show only rejected cars
     */
    $scope.showRejected = () => {
        $scope.activeButton = 'rejected';
        $scope.status = 'rejected';

        $scope.skip = 0;
        fetchProfileData("rejected");
    };
    
    /**
     * Filters car list to show only approved cars
     */
    $scope.showApproved = () => {
        $scope.activeButton = 'approved';
        $scope.status = 'approved';
        $scope.skip = 0;
        fetchProfileData("approved");
    };
    
    /**
     * Resets filters to show all cars regardless of status
     */
    $scope.showAll = () => {
        $scope.activeButton = 'all';
        $scope.status = 'all';
        
        $scope.skip = 0;
        fetchProfileData('all');
    };
    
    /**
     * Opens modal for updating car price
     * @param {Object} car - Car object containing price and ID
     */
    $scope.openPriceModal = (car) => {
        console.log(car);
        
        $scope.selectedCarId = car._id;
        $scope.selectedCarPrice.price = car.price;
        
        $uibModal.open({
            templateUrl: 'priceModal.html',
            scope: $scope
        });
    };
    
    /**
     * Submits updated car price to server
     * Called from price update modal
     */
    $scope.updatePrice = () => {
        const carId = $scope.selectedCarId;
        const carPrice = $scope.selectedCarPrice.price;

        if(carPrice < $scope.minPrice || carPrice > $scope.maxPrice){
            ToastService.error(`Car price cannot be less than ${$scope.minPrice} and greater than ${$scope.maxPrice}`);
            return;
        }
        
        CarService.updateCarPrice(carId, $scope.selectedCarPrice.price)
            .then(() => {
                ToastService.success("Car price updated successfully , It may take some time to reflect");
                $scope.skip = 0;
                fetchProfileData();
            })
            .catch((err) => {
                console.log(err);
                ToastService.error(`error updating the car price price cannot be less than 500 and greater than 10000 ${err.data.message}`);
            });
    };
    
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

                   const validateionResult =   UserFactory.validateUpdateUserData(data);
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
            fetchProfileData();
        }, function() {
            console.log('Modal dismissed');
        });
    };
    
    /**
     * Opens modal showing all bookings for a specific car
     * @param {Object} car - Car object containing booking information
     */
    $scope.viewCarBookings = function(car) {
        var modalInstance = $uibModal.open({
            templateUrl: 'components/profile/bookingsModal.html',
            controller: 'BookingsModalCtrl',
            resolve: {
                selectedCar: function() {
                    return car;
                }
            }
        });
    };

    // Load more cars
    $scope.loadMore = function () {
        if (!$scope.isLoading && $scope.hasMoreCars) {
            $scope.skip += $scope.limit;
            fetchProfileData($scope.status);
        }
    };

    // Open addons management modal
    $scope.openAddonsModal = function () {
        var modalInstance = $uibModal.open({
            templateUrl: 'addonsModal.html',
            controller: 'AddonsModalCtrl',
            resolve: {
                userCars: function () {
                    return $scope.userCars;
                }
            }
        });

        modalInstance.result.then(function (updatedCar) {
            // Update the car in the list with new addons
            var index = $scope.userCars.findIndex(car => car._id === updatedCar._id);
            if (index !== -1) {
                $scope.userCars[index] = updatedCar;
            }
        });
    };
});

angular.module("myApp").controller('AddonsModalCtrl', function ($scope, $uibModalInstance, userCars, UserService, ToastService) {
    $scope.userCars = userCars;
    $scope.selectedCar = null;
    $scope.newAddon = {
        name: '',
        price: 0,
        description: ''
    };
    $scope.isLoading = false;

    // Load addons for selected car
    $scope.loadCarAddons = function () {
            $scope.isLoading = true;
            UserService.getCarAddons()
                .then(function (response) {
                    console.log(response);
                    $scope.addons = response.addOns;
                })
                .catch(function (error) {
                    ToastService.error("Error loading addons: " + error.message);
                })
                .finally(function () {
                    $scope.isLoading = false;
                });
     };
    $scope.loadCarAddons();

    // Add new addon
    $scope.addAddon = function () {
     

        $scope.isLoading = true;
        UserService.addCarAddon($scope.newAddon)
            .then(function (response) {
                ToastService.success("Addon added successfully");
                $scope.loadCarAddons();
                // Reset form
                $scope.newAddon = {
                    name: '',
                    price: 0,
                    description: ''
                };
                $scope.addonForm.$setPristine();
            })
            .catch(function (error) {
                ToastService.error("Error adding addon: " + error.message);
            })
            .finally(function () {
                $scope.isLoading = false;
            });
    };

    // Remove addon
    $scope.removeAddon = function (addonId) {
        console.log(addonId);
        if (confirm('Are you sure you want to remove this addon?')) {
            $scope.isLoading = true;
            UserService.removeCarAddon(addonId)
                .then(function (response) {
                    console.log(response);
                    ToastService.success("Addon removed successfully");
                    $scope.loadCarAddons();
                })
                .catch(function (error) {
                    ToastService.error("Error removing addon: " + error.message);
                })
                .finally(function () {
                    $scope.isLoading = false;
                });
        }
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    // Close modal and return updated car
    $scope.close = function () {
        $uibModalInstance.close($scope.selectedCar);
    };
});