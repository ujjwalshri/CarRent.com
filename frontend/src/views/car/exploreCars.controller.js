/**
 * Home Controller - Main controller for the application landing page
 * Manages car listings, filtering, search, recommendations, and user interactions
 */
angular.module("myApp").controller("exploreCarsCtrl", function($scope, $state, ToastService, CarService, $timeout, UserService, UserFactory, $q, $rootScope, City, CarFactory, GeolocationService ) {

    // Initialize scope variables
    $scope.allCars = []; // Array to store all cars
    $scope.sort= {
        sortBy :'',// Current sort option
    }
    $scope.search = ''; // Current search query
    $scope.category = ''; // Current category filter
    $scope.cities = City.getCities(); // Array of all cities
    $scope.user = false; // User object

    $scope.skip = 0; // Number of cars to skip
    $scope.isLoading = false;
    $scope.loadingCars = false; // Flag to indicate if cars are loading
    $scope.limit = 5; // Number of cars to load per page
    $scope.filteringStarted = false; // Flag to indicate if filtering has started
    
    $scope.fuelTypes = CarFactory.fuelTypes;
    $scope.fuelType = ''; // Selected fuel type

    // Function to save filters to localStorage 
    function saveFiltersToLocalStorage() {
        const filters = {
            search: $scope.search,
            category: $scope.category,
            city: $scope.city,
            fuelType: $scope.fuelType,
            sortBy: $scope.sort.sortBy
        };
        localStorage.setItem('carFilters', JSON.stringify(filters));
    }

    // Function to load filters from localStorage
    function loadFiltersFromLocalStorage() {
        const savedFilters = localStorage.getItem('carFilters');
        if (savedFilters) {
            const filters = JSON.parse(savedFilters);
            $scope.search = filters.search;
            $scope.category = filters.category;
            $scope.city = filters.city;
            $scope.fuelType = filters.fuelType;
            $scope.sort.sortBy = filters.sortBy;
            return true;
        }
        return false;
    }

    // Debounce mechanism for search input
    let searchTimeout;
  
    $scope.recommendedCars = []; // Array to store recommended cars
    $scope.recommendedCarsGroups = []; // Array to store recommended cars in groups of 3
    $scope.active = 0; // Active index for carousel

    // Add filter toggle state
    $scope.isFilterCollapsed = true;
    
    // Function to toggle filter visibility
    $scope.toggleFilter = function() {
        $scope.isFilterCollapsed = !$scope.isFilterCollapsed;
    };

   /**
    * function to initialize the controller
    * @description: this function will be called when the controller is loaded, fetches the geolocation and cars initially
    */
    $scope.init = function() {
        const hasStoredFilters = loadFiltersFromLocalStorage();
        if (hasStoredFilters) {
            fetchCars();
        } else {
            fetchGeolocation();
        }
    };

    function fetchGeolocation(){
        $scope.loadingCars = true;
        GeolocationService.getUserLocationWithCity()
        .then((response) => {
            
            $scope.city = response.city;
            console.log("City fetched successfully:", $scope.city);
            return fetchCars();
        })
        .then(()=>{

            console.log("Cars fetched successfully");
        }).catch((error) => {
            console.error("Error fetching geolocation data:", error);
        })
    }

    function fetchCars() {
        console.log("Fetching cars called" , $scope.sort.sortBy);
        $scope.loadingCars = true;
        const promises = [
            CarService.getAllApprovedCars($scope.search, $scope.sort.sortBy, $scope.city, $scope.category, $scope.fuelType, $scope.skip),
            CarService.getAllCarCategories(),
        ];
        
        $q.all(promises)
            .then(function(responses) {
                if (responses[0] && responses[0].data) {
                    $scope.allCars = responses[0].data;
                    $scope.hasMoreCars = responses[0].data.length > $scope.limit;
                }
                if (responses[1]) {
                    $scope.carCategories = responses[1];
                }
            })
            .catch(function(errors) {
                console.log(errors);
            })
            .finally(function() {
                $scope.loadingCars = false;
            });
    }

    /**
     * Filters cars based on the current filters
     */
    $scope.filterCars = () => {
        $scope.skip = 0; // Reset skip when filters change
        $scope.allCars = []; // Clear existing cars
        saveFiltersToLocalStorage(); // Save filters when they change
        fetchCars();
    };

    /**
     * Filters cars with a delay to prevent too many API calls while typing
     * @returns {void} 
     */
    $scope.filterCarsWithDelay = () => {
        if (searchTimeout) {
            $timeout.cancel(searchTimeout);
        }
        searchTimeout = $timeout(() => {
            $scope.skip = 0; // Reset skip when search changes
            $scope.allCars = []; // Clear existing cars
            saveFiltersToLocalStorage(); // Save filters after delay
            fetchCars();
        }, 300);
    };

    /**
     * Loads more cars for infinite scrolling using the load more button
     * @returns {Promise<void>}
     */
    $scope.loadMoreCars = () => {
        $scope.isLoading = true;
        $scope.skip = $scope.allCars.length;
        
        if (!$scope.hasMoreCars) return;
    
        CarService.getAllApprovedCars($scope.search, $scope.sortBy, $scope.city, $scope.category, $scope.fuelType, $scope.skip)
            .then((res) => {
                if (res.data.length < $scope.limit) { // Changed <= to < to fix edge case
                    $scope.hasMoreCars = false;
                }
                $scope.allCars = $scope.allCars.concat(res.data);
            })
            .catch((err) => {
                ToastService.error(err);
            })
            .finally(() => {
                $scope.isLoading = false;
            });
    };
    
    /**
     * Resets all filters and fetches all cars
     */
    $scope.resetFilters = () => {
        $scope.filteringStarted = false;
        $scope.sort.sortBy = '';
        $scope.search = '';
        $scope.category = '';
        $scope.fuelType = '';
        $scope.skip = 0;
        $scope.isLoading = false;
        localStorage.removeItem('carFilters'); // Clear stored filters
        fetchGeolocation();
    };

    /**
     * Redirects to the single car detail page
     */
    $scope.redirectCarPage = (carID) => {
        if($rootScope.isLogged === false){
            $state.go('login');
            return; // Add this return to prevent further execution
        }
        $state.go("singleCar", {id: carID});
    };
});