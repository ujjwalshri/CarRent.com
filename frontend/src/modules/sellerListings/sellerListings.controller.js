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
        itemsPerPage: 8,
        totalItems: 0,
        totalPages: 0,
        maxSize: 5
    };
    
    // Get cities for filtering
    $scope.cities = City.getCities();
    
    /**
     * Initializes the controller
     * Fetches user cars with appropriate filters
     */
    $scope.init = function() {
        $scope.pagination.currentPage = 1;
        $scope.status = 'approved';
        $scope.search.searchQuery = '';
        $scope.userCars = [];
        
        // Fetch car listings
        fetchCarListings();
    };
    
    /**
     * Fetches car listings with current filters
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
            CarService.getAllCarCategoriesForAdmin()
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
     * Searches for cars with debouncing
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
     * Applies filters to car listings
     */
    $scope.filterCars = function() {
        $scope.pagination.currentPage = 1;
        fetchCarListings();
    };
    
    /**
     * Resets all filters and refreshes listings
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
     * Opens modal for updating car price
     */
    $scope.openPriceModal = function(car) {
        $scope.selectedCarId = car._id;
        $scope.selectedCarPrice.price = car.price;
        
        $uibModal.open({
            templateUrl: 'priceModal.html',
            scope: $scope
        });
    };
    
    /**
     * Submits updated car price to server
     */
    $scope.updatePrice = function() {
        const carId = $scope.selectedCarId;
        const carPrice = $scope.selectedCarPrice.price;

        if (carPrice < $scope.minPrice || carPrice > $scope.maxPrice) {
            ToastService.error(`Car price cannot be less than ${$scope.minPrice} and greater than ${$scope.maxPrice}`);
            return;
        }
        
        CarService.updateCarPrice(carId, $scope.selectedCarPrice.price)
            .then(function() {
                ToastService.success("Car price updated successfully. It may take some time to reflect.");
                $scope.pagination.currentPage = 1;
                fetchCarListings();
            })
            .catch(function(err) {
                ToastService.error(`Error updating the car price: ${err.data?.message || err}`);
            });
    };
    
    /**
     * Opens modal showing all bookings for a specific car
     */
    $scope.viewCarBookings = function(car) {
        $uibModal.open({
            templateUrl: 'modules/sellerListings/bookingsModal.html',
            controller: 'BookingsModalCtrl',
            resolve: {
                selectedCar: function() {
                    return car;
                }
            }
        });
    };
    
    /**
     * Opens addons management modal
     */
    $scope.openAddonsModal = function() {
        var modalInstance = $uibModal.open({
            templateUrl: 'modules/sellerListings/addonsModal.html',
            controller: 'AddonsModalCtrl',
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
     * Opens modal for adding a new car directly from the seller listings page
     */
    $scope.openAddCarModal = function() {
        $scope.addCarLoading = true;
        var modalInstance = $uibModal.open({
            templateUrl: 'modules/sellerListings/addCarModal.html',
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

