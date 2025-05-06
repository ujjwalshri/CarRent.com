/**
 * Home Controller - Main controller for the application landing page
 * Manages car listings, filtering, search, recommendations, and user interactions
 */
angular.module("myApp").controller("homeCtrl", function($scope, $state, ToastService, CarService, $timeout, UserService, UserFactory, $q, $rootScope, City, CarFactory, RecommendationService) {

    // Initialize scope variables
    $scope.allCars = []; // Array to store all cars
    $scope.priceFilter = ''; // Current price filter
    $scope.search = ''; // Current search query
    $scope.category = ''; // Current category filter
    $scope.cities = City.getCities(); // Array of all cities
    $scope.user = false; // User object
    $scope.city = ''; // Default city set to Delhi
    $scope.skip = 0; // Number of cars to skip
    $scope.isLoading = false;
    $scope.limit = 5; // Number of cars to load per page
    $scope.filteringStarted = false; // Flag to indicate if filtering has started
    $scope.loadingCars = false; // Loading state for cars
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
        fetchCarsAndRecommendations();
    };

    function fetchCarsAndRecommendations() {
        $scope.loadingCars = true;
        $rootScope.$on('user:loggedOut', function() {
           $rootScope.isLogged = false;
        })
        let promises = [];
        if ($rootScope.isLogged === false) {
            promises = [
                CarService.getAllApprovedCars($scope.search, $scope.priceFilter, $scope.city, $scope.category, $scope.skip),
                CarService.getAllCarCategoriesForAdmin(),
                CarService.getCurrentPriceRanges()
            ];
        } else {
            // Create params object with explicit city parameter to fix undefined city issue
            let params = {
                city: $scope.city || undefined
            };
            promises = [
                UserService.getUserProfile(),
                CarService.getAllApprovedCars($scope.search, $scope.priceFilter, $scope.city, $scope.category, $scope.skip),
                RecommendationService.getVehicleRecommendation(params),
                CarService.getAllCarCategoriesForAdmin(),
                CarService.getCurrentPriceRanges()
            ];
        }
        
        $q.all(promises)
            .then(function(responses) {
                if ($rootScope.isLogged === false) {
                    if (responses[0] && responses[0].data) {
                        $scope.allCars = responses[0].data;
                        $scope.hasMoreCars = responses[0].data.length > $scope.limit;
                    }
                    if (responses[1] && responses[1]) {
                        $scope.carCategories = responses[1];
                    }
                    if (responses[2] && responses[2]) {
                        $scope.priceRangeArray = CarFactory.getPriceRangeArray(responses[2][0].min, responses[2][0].max);
                    }
                } else {
                    if (responses[0] && responses[0].data) {
                        $scope.user = UserFactory.create(responses[0].data, false);
                    }
                    
                    if (responses[1] && responses[1].data) {
                        $scope.allCars = responses[1].data;
                        $scope.hasMoreCars = responses[1].data.length > $scope.limit;
                    }
                    
                    if (responses[2] && responses[2] && responses[2].recommendations) {
                        console.log(responses[2].recommendations);
                        const recommendations = responses[2].recommendations;
                        $scope.recommendedCarsGroups = [];
                        for (let i = 0; i < recommendations.length; i += 3) {
                            $scope.recommendedCarsGroups.push(
                                recommendations.slice(i, i + 3)
                            );
                        }
                    }
                    
                    if (responses[3] && responses[3]) {
                        $scope.carCategories = responses[3];
                    }
                    if (responses[4] && responses[4]) {
                        $scope.priceRangeArray = CarFactory.getPriceRangeArray(responses[4][0].min, responses[4][0].max);
                    }
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
     * @returns {Promise<void>}
     */
    $scope.filterCars = () => {
        // Set filtering started flag when any filter is applied
        fetchCarsAndRecommendations();
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
            $scope.filterCars();
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
    
        CarService.getAllApprovedCars($scope.search, $scope.priceFilter, $scope.city, $scope.category, $scope.skip)
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
     * function to reset all the filters and fetch all the cars
     */
    $scope.resetFilters = () => {
        $scope.filteringStarted = false;
        $scope.priceFilter = '';
        $scope.search = '';
        $scope.category = '';
        $scope.city = '';
        $scope.skip = 0;
        fetchCarsAndRecommendations();
    };

    /**
     * Redirects to the single car detail page
     */
    $scope.redirectCarPage = (carID) => {
        $state.go("singleCar", {id: carID});
    };
});