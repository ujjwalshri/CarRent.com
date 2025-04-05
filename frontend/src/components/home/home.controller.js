/**
 * Home Controller - Main controller for the application landing page
 * Manages car listings, filtering, search, recommendations, and user interactions
 */
angular.module("myApp").controller("homeCtrl", function($scope, $state, ToastService, CarService, $timeout, UserService, UserFactory, $q, $rootScope, City) {

    // Initialize scope variables
    $scope.allCars = [];
    $scope.priceFilter = '';
    $scope.search = '';
    $scope.category = '';
    $scope.cities = City.getCities();
    $scope.user = false;
    $scope.city = '';
    $scope.skip = 0;
    $scope.isLoading = false;
    $scope.limit = 5;
    $scope.filteringStarted = false;
    
    // Debounce mechanism for search input
    let searchTimeout;
  
    $scope.recommendedCars = [];
    $scope.recommendedCarsGroups = [];
    $scope.active = 0;
   
    /**
     * Initializes the home page
     */
    $scope.init = function() {
        $scope.isLoading = true;
        
        let promises = [];
        
        if ($rootScope.isLogged === false) {
            promises = [
                CarService.getAllApprovedCars($scope.search, $scope.priceFilter, $scope.city, $scope.category, $scope.skip),
                CarService.getAllCarCategoriesForAdmin()
            ];
        } else {
            const params = {
                city: $scope.city,
            }
            promises = [
                UserService.getUserProfile(),
                CarService.getAllApprovedCars($scope.search, $scope.priceFilter, $scope.city, $scope.category, $scope.skip),
                CarService.getCarRecommendationsForUser(params),
                CarService.getAllCarCategoriesForAdmin()
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
                } else {
                    if (responses[0] && responses[0].data) {
                        $scope.user = UserFactory.create(responses[0].data, false);
                    }
                    
                    if (responses[1] && responses[1].data) {
                        $scope.allCars = responses[1].data;
                        $scope.hasMoreCars = responses[1].data.length > $scope.limit;
                    }
                    
                    if (responses[2] && responses[2] && responses[2].recommendations) {
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
                }
            })
            .catch(function(errors) {
                console.error("Error loading data:", errors);
                ToastService.error(typeof errors === 'string' ? errors : 'Error loading data');
            })
            .finally(function() {
                $scope.isLoading = false;
            });
    };

    /**
     * Fetches filtered cars from the database
     */
    function fetchAllCars(skip) {
        CarService.getAllApprovedCars($scope.search, $scope.priceFilter, $scope.city, $scope.category, skip)
            .then((res) => {
                $scope.allCars = res.data;
                $scope.hasMoreCars = res.data.length > $scope.limit;
            })
            .catch(err => {
                ToastService.error(err);
            });
    }

    /**
     * Applies all current filters and fetches filtered car listings
     */
    $scope.filterCars = () => {
        $scope.filteringStarted = true;
        fetchAllCars(0);
    };

    /**
     * Debounced version of filterCars for search input
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
     * Loads more cars for infinite scrolling
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
     * Resets all filters to their defaults
     */
    $scope.resetFilters = () => {
        $scope.filteringStarted = false;
        $scope.priceFilter = '';
        $scope.search = '';
        $scope.category = '';
        $scope.city = '';
        fetchAllCars(0);
    };

    /**
     * Redirects to the single car detail page
     */
    $scope.redirectCarPage = (carID) => {
        $state.go("singleCar", {id: carID});
    };
});