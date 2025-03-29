angular.module("myApp").controller("homeCtrl", function($scope, $state, ToastService, CarService, $timeout, UserService, UserFactory, $q, $rootScope) {
    $scope.allCars = []; // array to hold all the cars
    $scope.priceFilter = ''; // filter to hold the price filter
    $scope.search = ''; // filter to hold the search filter
    $scope.category = ''; // filter to hold the category filter
    
    $scope.user = false;
    $scope.carLocation = ''; // filter to hold the car location filter
    $scope.city = ''; // filter to hold the city filter
    $scope.skip = 0; // variable to hold the skip value for pagination
    $scope.isLoading = false; // variable to hold the loading state of the page
    $scope.limit = 5; // variable to hold the limit of the cars to be fetched
    
    let searchTimeout; // variable to hold the search timeout
    
    // Recommended cars data
    $scope.recommendedCars = [];
    $scope.recommendedCarsGroups = [];
    $scope.active = 0;
   
    // init function to run when the page mounts
    $scope.init = function() {
        $scope.isLoading = true;
        
        // Create an array of promises to run in parallel
        let promises = [];
        
        // Check if the user is logged in
        if ($rootScope.isLogged === false) {
            console.log("not logged in");
            // Not logged in - only get cars
            promises = [
                CarService.getAllApprovedCars($scope.search, $scope.priceFilter, $scope.city, $scope.category, $scope.skip)
            ];
        } else {
            // Logged in - get user, cars, and recommendations
            promises = [
                UserService.getUserProfile(),
                CarService.getAllApprovedCars($scope.search, $scope.priceFilter, $scope.city, $scope.category, $scope.skip),
                CarService.getCarRecommendationsForUser()
            ];
        }
        
        // Execute all promises in parallel
        $q.all(promises)
            .then(function(responses) {
                console.log("responses", responses);
                
                // Handle different cases based on login status
                if ($rootScope.isLogged === false) {
                    // Not logged in - first response is all cars
                    if (responses[0] && responses[0].data) {
                        $scope.allCars = responses[0].data;
                        $scope.hasMoreCars = responses[0].data.length > $scope.limit;
                    }
                } else {
                    // Logged in - handle all three responses
                    
                    // Handle user profile data - first response
                    if (responses[0] && responses[0].data) {
                        $scope.user = UserFactory.create(responses[0].data, false);
                    }
                    
                    // Handle cars data - second response
                    if (responses[1] && responses[1].data) {
                        console.log("cars", responses[1].data);
                        $scope.allCars = responses[1].data;
                        $scope.hasMoreCars = responses[1].data.length > $scope.limit;
                    }
                    
                    // Handle recommendations data - third response
                    if (responses[2] && responses[2] && responses[2].recommendations) {
                        const recommendations = responses[2].recommendations;
                        console.log("recommendations", recommendations);
                        
                        // Group recommendations in sets of 3 for carousel
                        $scope.recommendedCarsGroups = [];
                        for (let i = 0; i < recommendations.length; i += 3) {
                            $scope.recommendedCarsGroups.push(
                                recommendations.slice(i, i + 3)
                            );
                        }
                        console.log("recommendedCarsGroups", $scope.recommendedCarsGroups);
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

    /*
    function to fetch all the cars from the database
    @params skip
    @returns cars
    */
    function fetchAllCars(skip){
        CarService.getAllApprovedCars($scope.search, $scope.priceFilter, $scope.city, $scope.category, skip).then((res)=>{
            console.log("cars", res.data);
            $scope.allCars = res.data;
            $scope.hasMoreCars = res.data.length > $scope.limit; 
        }).catch(err=>{
            ToastService.error(err);
        });
    }

    // function to filter the cars
    $scope.filterCars = () => {
        fetchAllCars(0);
    };

    // function to filter the cars with a delay for debouncing
    $scope.filterCarsWithDelay = () => {
        // call the all cars with the all filters but with a delay of 1 second
        if (searchTimeout) {
            $timeout.cancel(searchTimeout); 
        }
        searchTimeout = $timeout(()=>{
            $scope.filterCars();
        }, 200);
    };

    /*
    function to load more cars when the user clicks on the load more button
    @params none
    @returns none
    */
    $scope.loadMoreCars = () => {
        $scope.isLoading = true; 
        console.log('isLoading');
        $scope.skip = $scope.allCars.length; 
        console.log('skip', $scope.skip);
        if (!$scope.hasMoreCars) return;
    
        CarService.getAllApprovedCars($scope.search, $scope.priceFilter, $scope.city, $scope.category, $scope.skip)
            .then((res) => {
                if (res.data.length <= $scope.limit) {
                    $scope.hasMoreCars = false; 
                    console.log('no more cars');
                }
                $scope.allCars = $scope.allCars.concat(res.data); // Append new cars to the existing list
                $scope.skip += $scope.limit; // Increment the skip value for the next request
            })
            .catch((err) => {
                ToastService.error(err);
            }).finally(()=>{
                $scope.isLoading = false;
            });
    };
    
    // function to reset all the filters on the page
    $scope.resetFilters = () => {
        $scope.priceFilter = '';
        $scope.search = ''; 
        $scope.category = '';
        $scope.carLocation = '';
        
        // Use $scope.user instead of loggedInUser
        $scope.city = ($scope.user && $scope.user.city) ? $scope.user.city : '';
        
        fetchAllCars(0);
    };

    // function to redirect to the single car page
    $scope.redirectCarPage = (carID) => {
        console.log("carID", carID);
        $state.go("singleCar", {id: carID});
    };
    
    // Carousel navigation functions for recommendations
    $scope.nextSlide = function() {
        if ($scope.active < $scope.recommendedCarsGroups.length - 1) {
            $scope.active++;
        } else {
            $scope.active = 0;
        }
    };

    $scope.prevSlide = function() {
        if ($scope.active > 0) {
            $scope.active--;
        } else {
            $scope.active = $scope.recommendedCarsGroups.length - 1;
        }
    };
});