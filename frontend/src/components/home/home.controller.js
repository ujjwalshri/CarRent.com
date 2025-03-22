angular.module("myApp").controller("homeCtrl", function($scope, $state, ToastService, CarService,$timeout) {
    $scope.allCars = []; // array to hold all the cars
    $scope.priceFilter = ''; // filter to hold the price filter
    $scope.search = ''; // filter to hold the search filter
    $scope.category = ''; // filter to hold the category filter
    const loggedInUser = JSON.parse(sessionStorage.getItem("user"));
    $scope.carLocation = ''; // filter to hold the car location filter
    $scope.city = ''; // filter to hold the city filter
    $scope.skip = 0; // variable to hold the skip value for pagination
    $scope.isLoading = false; // variable to hold the loading state of the page
    $scope.limit = 5; // variable to hold the limit of the cars to be fetched
   
   
    
    // init function to run when the page mounts
    $scope.init = function (){
            fetchAllCars($scope.skip);
    };
    // function to get all the cars that have status === approved and car is not deleted
    function fetchAllCars(skip){
        CarService.getAllApprovedCars($scope.search, $scope.priceFilter, $scope.city, $scope.category, skip).then((res)=>{
            console.log("cars", res.data);
            $scope.allCars =res.data;
            $scope.hasMoreCars = res.data.length > $scope.limit; 
        }).catch(err=>{
            ToastService.error(err);
        });
    }

    $scope.filterCars = () => {
        fetchAllCars(0);
    };

    $scope.filterCarsWithDelay = () => {
        // call the all cars with the all filters but with a delay of 1 second
       $timeout(()=>{
         $scope.filterCars();
       },300)
    };
 
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
        $scope.city = loggedInUser ? loggedInUser.city : '';
        fetchAllCars(0);
    };

    // function to redirect to the single car page
    $scope.redirectCarPage = (carID) => {
        $state.go("singleCar", {id: carID});
    };

});