angular.module("myApp").controller("carCtrl", function ($scope, $state, IDB, ToastService, CarService) {
  $scope.carCategories  = [];
  $scope.carCategory = "";
  

  $scope.init = () => {
    fetchPendingCars(); // initial fetch of pending cars
    $scope.fetchCarCategories();
  };

  $scope.fetchCarCategories = () => {
    CarService.getAllCarCategoriesForAdmin().then((categories) => {
      console.log(categories);
      $scope.carCategories = categories;
    }).catch((err)=>{
      ToastService.error("Error fetching car categories");
    })
  }
  $scope.addCarCategory = () => {
    if($scope.carCategory.trim() === "" || $scope.carCategory.trim().length < 3){
      ToastService.error("Car category cannot be empty or less than 3 characters");
      return;
    }
    

  
   
    console.log($scope.carCategory);
    CarService.addCarCategory($scope.carCategory).then((category) => {
      $scope.fetchCarCategories();
      
    }).catch((err)=>{
      ToastService.error("Error adding car category");
    }).finally(()=>{
      $scope.carCategory = "";
    })
  }

  $scope.deleteCarCategory = (categoryID) => {
    console.log(categoryID);
    CarService.deleteCarCategory(categoryID).then(()=>{
      $scope.fetchCarCategories();
    }).catch((err)=>{
      ToastService.error("Error deleting car category");
    })
  }

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
