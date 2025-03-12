angular.module("myApp").controller("carCtrl", function ($scope, $state, IDB, ToastService) {

  
  $scope.init = () => {
    fetchPendingCars(); // initial fetch of pending cars
  };
   /*
   function to get the pending cars from the database
    @params none
    @returns none
   */
  function fetchPendingCars() {
    IDB.getPendingCars() // calling the db function to get the pending cars
      .then((cars) => {
        $scope.cars = cars; // setting the cars array to the cars fetched from the db
      })
      .catch((err) => {
       ToastService.error("error fetching cars"); // showing the error message
      });
  }


  // function to approve a car
  $scope.approveCar = (carID) => {
    console.log(carID);
    IDB.approveCar(carID) // calling the db function to approve the car
      .then(() => {
        ToastService.success("car approved successfully"); // showing the success message
        fetchPendingCars(); // fetching the pending cars again
      })
      .catch((err) => {
        ToastService.error(`error approving car ${err}`);// showing the error message
      });
  };

  // function to reject a car
  $scope.rejectCar = (carID) => {
    IDB.rejectCar(carID) // calling the db function to reject the car
      .then(() => {
        ToastService.success("car rejected successfully"); // showing the success message
        fetchPendingCars(); // fetching the pending cars again
      })
      .catch((err) => {
        ToastService.error(`error rejecting the car ${err}`); // showing the error message
      });
  };
});
