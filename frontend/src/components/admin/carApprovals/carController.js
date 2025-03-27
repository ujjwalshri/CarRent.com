angular.module("myApp").controller("carCtrl", function ($scope, $state, IDB, ToastService, CarService) {
  $scope.init = () => {
    fetchPendingCars(); // initial fetch of pending cars
  };

   /*
   function to get the pending cars from the database
    @params none
    @returns none
   */
  function fetchPendingCars() {
    CarService.getCars().then((cars) => {
      $scope.cars = cars; 
      console.log($scope.cars);
    }).catch((err)=>{
      ToastService.error("Error fetching pending cars");
    })
  }


/*
   function to approve car from the database
    @params carID
    @returns none
   */  
  $scope.approveCar = (carID) => {
    CarService.approveCar(carID).then(()=>{
      ToastService.success("Car approved successfully");
      fetchPendingCars();
    }).catch((err)=>{
      ToastService.error(`Error approving car ${err}`);
      });
  };


/*
   function to reject car from the database
    @params carID
    @returns none
   */  
  $scope.rejectCar = (carID) => {
    CarService.rejectCar(carID).then(()=>{
      ToastService.success("Car rejected successfully");
      fetchPendingCars();
    }).catch((err)=>{
      ToastService.error(`Error rejecting car ${err}`);
      });
  };
});
