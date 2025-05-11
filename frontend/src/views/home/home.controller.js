/**
 * Home Controller - Main controller for the application landing page
 * Manages car listings, filtering, search, recommendations, and user interactions
 */
angular.module("myApp").controller("homeCtrl", function($scope, $state, ToastService, CarService, $timeout, UserService, UserFactory, $q, $rootScope, City, CarFactory, GeolocationService ) {

    // Initialize scope variables
    $scope.allCars = []; // Array to store all cars
    $scope.sortBy = ''; // Current sort option
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
    
    // Sort options
    $scope.sortOptions = [
        { value: '', label: 'Most Recent' },
        { value: 'price-low', label: 'Price: Low to High' },
        { value: 'price-high', label: 'Price: High to Low' },
    ];

    // Debounce mechanism for search input
    let searchTimeout;
  
    $scope.recommendedCars = []; // Array to store recommended cars
    $scope.recommendedCarsGroups = []; // Array to store recommended cars in groups of 3
    $scope.active = 0; // Active index for carousel
   
   /**
    * Initializes the home page by loading cars, categories, price ranges and user data
    * 
    * @function init
    * @description
    * - For logged out users:
    *   1. Loads approved cars with current filters
    *   2. Gets all car categories
    *   3. Gets price range configuration
    * 
    * - For logged in users:
    *   1. Gets user profile data
    *   2. Loads approved cars with current filters  
    *   3. Gets personalized car recommendations based on user's city or on the basis of the user's selected city
    *   4. Gets all car categories
    *   5. Gets price range configuration
    * 
    * All requests are made in parallel using $q.all() for better performance
    * Updates scope variables with the fetched data:
    * - allCars: List of filtered cars
    * - hasMoreCars: Flag for pagination
    * - carCategories: Available car categories
    * - priceRangeArray: Array of price range options
    * - user: Logged in user profile (if authenticated)
    * - recommendedCarsGroups: Personalized recommendations (if authenticated)
    */
    $scope.init = function() {
        fetchGeolocation();
    };

    function fetchGeolocation(){
        $scope.loadingCars = true;
        GeolocationService.getUserLocationWithCity().then((response) => {
            $scope.city = response.city;
            fetchCars();
        }
        ).catch((error) => {
            console.error("Error fetching geolocation data:", error);
        })
    }

    function fetchCars() {
        $scope.loadingCars = true;
           const promises = [
                CarService.getAllApprovedCars($scope.search, $scope.sortBy, $scope.city, $scope.category, $scope.fuelType, $scope.skip),
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
                if (res.data.length <= $scope.limit) {
                    $scope.hasMoreCars = false;
                }
                $scope.allCars = $scope.allCars.concat(res.data);
                $scope.skip += $scope.limit;
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
        $scope.sortBy = '';
        $scope.search = '';
        $scope.category = '';
        $scope.fuelType = '';
        $scope.skip = 0;
        $scope.isLoading = false;
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