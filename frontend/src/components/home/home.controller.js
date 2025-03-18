angular.module("myApp").controller("homeCtrl", function($scope, $state, ToastService, CarService) {
    $scope.allCars = []; // array to hold all the cars
    $scope.priceFilter = ''; // filter to hold the price filter
    $scope.search = ''; // filter to hold the search filter
    $scope.category = ''; // filter to hold the category filter
    const loggedInUser = JSON.parse(sessionStorage.getItem("user"));
    $scope.carLocation = ''; // filter to hold the car location filter
    $scope.city = loggedInUser ? loggedInUser.city: ''; // filter to hold the city filter
    
    // init function to run when the page mounts
    $scope.init = function (){
        // function to get all the cars that have status === approved
        fetchAllCars();
    };
    // function to get all the cars that have status === approved and car is not deleted
    function fetchAllCars(){
        CarService.getAllApprovedCars().then((res)=>{
            $scope.allCars = res.data;
        }).catch(err=>{
            ToastService.error(err);
        });
       
    }

    // function to reset all the filters on the page
    $scope.resetFilters = () => {
        $scope.priceFilter = '';
        $scope.search = ''; 
        $scope.category = '';
        $scope.carLocation = '';
        $scope.city = loggedInUser ? loggedInUser.city : '';
    };

    // function to redirect to the single car page
    $scope.redirectCarPage = (carID) => {
        $state.go("singleCar", {id: carID});
    };

});