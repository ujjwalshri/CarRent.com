/**
 * My Profile Controller
 * Handles user profile data display, editing, and car management for sellers
 * @module myProfileCtrl
 */
angular.module("myApp").controller("myProfileCtrl", function($scope, $state, IDB, ToastService, $uibModal, BackButton, UserService, CarService, BiddingService, City, $q) {

    $scope.isSeller = true; 
    $scope.deleted = false;
    
    $scope.userCars = [];
    $scope.hasMoreCars = true;
    $scope.selectedCarPrice = { price: 0 };
    
    $scope.activeButton = 'all';
    $scope.status;
    
    $scope.skip = 0;
    $scope.limit = 10;
    
    $scope.cities = City.getCities();
    
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
        const params = {
            skip: $scope.skip,
            limit: $scope.limit
        }
        console.log(params);
        $q.all([
            UserService.getUserProfile(),
            CarService.fetchUserCars(status ? status : 'all', params)
        ]).then((result)=>{
            console.log(result);
            $scope.user = result[0].data;
            $scope.updateUser = $scope.user;

            $scope.skip == 0 
            ? $scope.userCars = result[1].data 
            : $scope.userCars = $scope.userCars.concat(result[1].data);
        
        $scope.hasMoreCars = result[1].data.length > 0;
        }).catch((err)=>{
            ToastService.error("Error fetching the profile data" + err);
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
        console.log($scope.selectedCarPrice.price);
        const carPrice = $scope.selectedCarPrice.price;
        console.log(carPrice);  
        console.log(carId);
        console.log($scope.selectedCarPrice.price);
        
        CarService.updateCarPrice(carId, $scope.selectedCarPrice.price)
            .then(() => {
                ToastService.success("Car price updated successfully");
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
            controller: function($scope, $uibModalInstance, userData, UserService, ToastService) {
                $scope.updatedUser = angular.copy(userData);
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
                    if(!data.firstName || !data.lastName){
                        ToastService.error("first name and last name cannot be empty");
                        return;
                    }

                    if(data.firstName.length < 3 || data.firstName.length>50 || data.lastName.length < 3 || data.lastName.length > 50){
                        ToastService.error("first name and last name invalid");
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
});