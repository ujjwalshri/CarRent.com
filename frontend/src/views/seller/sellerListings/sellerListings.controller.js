/**
 * Controller for the seller listings component
 * Shows all cars listed by the user with advanced filtering and management capabilities
 */
angular.module('myApp').controller('sellerListingsCtrl', function($scope, $state, $uibModal, ToastService, CarService, UserService, City, $q, $timeout, CarFactory) {
    // Initialization variables
    $scope.userCars = []; // Array to hold user's cars
    $scope.selectedCarPrice = { price: 0 }; // Object to hold selected car price
    $scope.priceRanges = [];
    $scope.categories = [];

    
    // Loading and state variables
    $scope.loading = false; // Flag to indicate loading state
    $scope.noListings = false; // Flag to indicate if there are no listings
    $scope.activeButton = 'approved'; // Active filter button
    $scope.status = 'approved'; // Filter status for cars (approved, rejected, all)
    $scope.showFilters = true; // Show filters by default
    
    // Filter and search variables
    $scope.search = {
        searchQuery: '',
        searchTimeout: null
    };
    // Filter object to hold selected filters
    $scope.filters = {
        category: '',
        city: '',
        priceRange: ''
    };
    
    // Pagination variables
    $scope.pagination = {
        currentPage: 1,
        itemsPerPage: 3,
        totalItems: 0,
        totalPages: 0,
        maxSize: 5
    };
    
    // Get cities for filtering
    $scope.cities = City.getCities();
    
    /**
     * Initializes the controller and fetches car listings
     * @description: This function is called when the controller is loaded.
     * It fetches the car listings based on the current filters and pagination settings.
     * It also fetches the price ranges, search and categories for filtering.
     * @returns {Promise} - A promise that resolves when the car listings are fetched.
     * @throws {Error} - Throws an error if there is an issue fetching the car listings.
     */
    $scope.init = function() {
        // Fetch car listings
        fetchCarListings();
    };
    
    /**
     * @description: This function fetches the car listings based on the current filters and pagination settings.
     * It also fetches the price ranges, search and categories for filtering.
     */
    function fetchCarListings() {
        $scope.loading = true;
        
        // Calculate skip based on currentPage and itemsPerPage
        const skip = ($scope.pagination.currentPage - 1) * $scope.pagination.itemsPerPage;
        
        const params = {
            skip: skip,
            limit: $scope.pagination.itemsPerPage,
            search: $scope.search.searchQuery || '',
            carStatus: $scope.status || 'all',
            category: $scope.filters.category || '',
            city: $scope.filters.city || '',
            priceRange: $scope.filters.priceRange || ''
        };
        
        // Get cars, price ranges, and categories
        $q.all([
            CarService.fetchUserCars($scope.status || 'approved', params),
            CarService.getCurrentPriceRanges(),
            CarService.getAllCarCategories()
        ]).then(function(results) {
            // Update car listings - fix to use the data array from the response
            if (results[0].data && results[0].data.data) {
                $scope.userCars = results[0].data.data;
                $scope.pagination.totalItems = results[0].data.totalDocs || 0;
                $scope.pagination.totalPages = Math.ceil($scope.pagination.totalItems / $scope.pagination.itemsPerPage);
            }  else {
                $scope.userCars = [];
                $scope.pagination.totalItems = 0;
                $scope.pagination.totalPages = 0;
            }
            
            // Set no listings flag
            $scope.noListings = $scope.userCars.length === 0;
            
            // Set price ranges
            $scope.minPrice = results[1][0].min;
            $scope.maxPrice = results[1][0].max;
            $scope.priceRanges = CarFactory.getPriceRangeArray($scope.minPrice, $scope.maxPrice);
            
            // Set categories
            $scope.categories = results[2];
        }).catch(function(err) {
            ToastService.error("Error fetching car listings: " + err);
        }).finally(function() {
            $scope.loading = false;
        });
    }
    
    /**
     * @description: This function is called when the user types in the search box.
     * It debounces the search to avoid making too many API calls.
     * @returns {Promise} - A promise that resolves when the search is completed.
     * @throws {Error} - Throws an error if there is an issue fetching the car listings.
     */
    $scope.searchCars = function() {
        if ($scope.search.searchTimeout) {
            $timeout.cancel($scope.search.searchTimeout);
        }
        
        $scope.search.searchTimeout = $timeout(function() {
            $scope.pagination.currentPage = 1; // Reset pagination when searching
            fetchCarListings();
        }, 500); // Debounce for 500ms
    };
    
    /**
     * @description: This function filters the car listings based on the selected filters.
     * It resets the pagination to the first page and fetches the car listings.
     * @returns {Promise} - A promise that resolves when the car listings are filtered.
     * @throws {Error} - Throws an error if there is an issue fetching the car listings.
     */
    $scope.filterCars = function() {
        $scope.pagination.currentPage = 1;
        fetchCarListings();
    };
    
    /**
     * @description: This function resets all filters and search queries.
     * It resets the pagination to the first page and fetches the car listings.
     * @returns {Promise} - A promise that resolves when the filters are reset.
     * @throws {Error} - Throws an error if there is an issue fetching the car listings.
     */
    $scope.reset = function() {
        $scope.filters = {
            category: '',
            city: '',
            priceRange: ''
        };
        $scope.search.searchQuery = '';
        $scope.search.searchTimeout = null;
        $scope.pagination.currentPage = 1;
        $scope.status = 'approved';
        $scope.activeButton = 'approved';
        fetchCarListings();
    };
    
    /**
     * Filters car list to show only rejected cars
     */
    $scope.showRejected = function() {
        $scope.activeButton = 'rejected';
        $scope.status = 'rejected';
        $scope.pagination.currentPage = 1;
        fetchCarListings();
    };
    
    /**
     * Filters car list to show only approved cars
     */
    $scope.showApproved = function() {
        $scope.activeButton = 'approved';
        $scope.status = 'approved';
        $scope.pagination.currentPage = 1;
        fetchCarListings();
    };
    
    /**
     * Filters car list to show only pending cars
     */
    $scope.showPending = function() {
        $scope.activeButton = 'pending';
        $scope.status = 'pending';
        $scope.pagination.currentPage = 1;
        fetchCarListings();
    };
    
    /**
     * Shows all cars regardless of status
     */
    $scope.showAll = function() {
        $scope.activeButton = 'all';
        $scope.status = 'all';
        $scope.pagination.currentPage = 1;
        fetchCarListings();
    };
    
    /**
     * Handles pagination page change event
     */
    $scope.pageChanged = function() {
        fetchCarListings();
    };
    
  
    /**
     * upens modal for updating car price
     * @param {Object} car - The car object to update
     * @param {number} minPrice - The minimum price for the car
     * @param {number} maxPrice - The maximum price for the car
     * returns {Promise} - A promise that resolves when the modal is closed
     */
    $scope.openPriceModal = function(car) {
        $scope.selectedCar = car;
        $scope.selectedCarPrice.price = car.price;
        
        var modalInstance = $uibModal.open({
            templateUrl: 'priceModal.html',
            size: 'md',
            backdrop: 'static',
            controller: function($scope, $uibModalInstance, selectedCarPrice, selectedCar, minPrice, maxPrice, CarService, ToastService) {
                $scope.selectedCarPrice = selectedCarPrice;
                $scope.selectedCar = selectedCar;
                
                $scope.updatePrice = function() {
                    if ($scope.selectedCarPrice.price < minPrice || $scope.selectedCarPrice.price > maxPrice) {
                        ToastService.error(`Car price cannot be less than ${minPrice} and greater than ${maxPrice}`);
                        return;
                    }
                    
                    CarService.updateCarPrice(selectedCar._id, $scope.selectedCarPrice.price)
                        .then(function() {
                            ToastService.success("Car price updated successfully. It may take some time to reflect.");
                            $uibModalInstance.close($scope.selectedCarPrice.price);
                        })
                        .catch(function(err) {
                            ToastService.error(`Error updating the car price: ${err.data?.message || err}`);
                        });
                };

                $scope.cancel = function() {
                    $uibModalInstance.dismiss('cancel');
                };
            },
            resolve: {
                selectedCarPrice: function() {
                    return $scope.selectedCarPrice;
                },
                selectedCar: function() {
                    return $scope.selectedCar;
                },
                minPrice: function() {
                    return $scope.minPrice;
                },
                maxPrice: function() {
                    return $scope.maxPrice;
                }
            }
        });

        modalInstance.result.then(function() {
            $scope.pagination.currentPage = 1;
            fetchCarListings();
        });
    };
    
   /**
    * @description: This function opens a modal to view bookings for a specific car.
    * It uses the $uibModal service to open a modal with the bookingsModal template and the BookingsModalCtrl controller.
    * @param {Object} car - The car object for which to view bookings
    * @returns {Promise} - A promise that resolves when the modal is closed.
    */
    $scope.viewCarBookings = function(car) {
        $uibModal.open({
            templateUrl: 'views/seller/sellerListings/bookingsModal/bookingsModal.html',
            controller: 'BookingsModalCtrl',
            resolve: {
                selectedCar: function() {
                    return car;
                }
            }
        });
    };
    
   /**
    * @description: This function opens a modal to add addons to a car.
    * It uses the $uibModal service to open a modal with the addonsModal template and the AddonsModalCtrl controller.
    * @returns {Promise} - A promise that resolves when the modal is closed.
    */
    $scope.openAddonsModal = function() {
        var modalInstance = $uibModal.open({
            templateUrl: 'views/seller/sellerListings/addonsModal/addonsModal.html',
            controller: 'AddonsModalCtrl',
            size: 'md',
            backdrop: 'static',
            resolve: {
                userCars: function() {
                    return $scope.userCars;
                }
            }
        });

        modalInstance.result.then(function(updatedCar) {
            // Update the car in the list with new addons
            var index = $scope.userCars.findIndex(car => car._id === updatedCar._id);
            if (index !== -1) {
                $scope.userCars[index] = updatedCar;
            }
        });
    };

    /**
     * @description: This function opens a modal to add a new car.
     * It uses the $uibModal service to open a modal with the addCarModal template and the AddCarModalCtrl controller.
     * @returns {Promise} - A promise that resolves when the modal is closed.
     * @throws {Error} - Throws an error if there is an issue adding the car.
     */
    $scope.openAddCarModal = function() {
        $scope.addCarLoading = true;
        var modalInstance = $uibModal.open({
            templateUrl: 'views/seller/sellerListings/addCarModal/addCarModal.html',
            controller: 'AddCarModalCtrl',
            size: 'md',
            backdrop: 'static'
        });

        modalInstance.result.then(function(newCar) {
            // Refresh the car listings after successfully adding a car
            $scope.pagination.currentPage = 1;
            fetchCarListings();
        });
    };
});

