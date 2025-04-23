angular.module("myApp").controller("carCtrl", function ($scope, ToastService, CarService, $q) {
  $scope.carCategories  = []; // array to store the car categories
  $scope.carCategory = ""; // string to store the car category
  $scope.isLoading = false; 
  $scope.priceRange = {min: 0, max: 0}; // object to store the price range
  $scope.platformCharge = {percentage: 0}; // object to store the platform charge percentage
  
   /*
    function to initialize the car controller
    @params none
    @returns none
   */
  $scope.init = () => {
    fetchCarManagementData();
  };
  
  /**
   * Fetches car management data from the database
   * @returns {void}
   */
  function fetchCarManagementData(){
    $scope.isLoading = true;
    $q.all([  
      CarService.getCars(),
      CarService.getAllCarCategoriesForAdmin(),
      CarService.getCurrentPriceRanges(),
      CarService.getCharges()
    ]).then(([cars, carCategories, priceRanges, charges]) => {
      $scope.cars = cars;
      $scope.carCategories = carCategories;
      $scope.priceRange = priceRanges[0];
      console.log(charges);
      $scope.platformCharge.percentage = charges[0].percentage;
    }).catch((err)=>{
      ToastService.error("Error fetching car management data");
    }).finally(()=>{
      $scope.isLoading = false;
    })
  }
  
  /**
   * Saves the platform charge percentage
   * @returns {void}
   */
  $scope.savePlatformCharge = () => {
    
   
    CarService.updateCharges({charge: "Platform Fee", percentage: $scope.platformCharge.percentage })
      .then(() => {
        ToastService.success("Platform charge updated successfully");
        fetchCarManagementData();
      })
      .catch((err) => {
        ToastService.error("Error updating platform charge");
      });
  }

  /**
   * Adds a car category to the database
   * @returns {void}
   */
  $scope.addCarCategory = () => {
    if($scope.carCategory.trim() === "" || $scope.carCategory.trim().length < 3){
      ToastService.error("Car category cannot be empty or less than 3 characters");
      return;
    }

    CarService.addCarCategory($scope.carCategory).then((category) => {
      ToastService.success("Car category added successfully");
      fetchCarManagementData();
    }).catch((err)=>{
      ToastService.error("Error adding car category");
    }).finally(()=>{
      $scope.carCategory = "";
    })
  }

  /**
   * Adds a price range to the database
   * @returns {void}
   */
  $scope.addPriceRange = () => {
    CarService.updateCarPriceRange($scope.priceRange).then((priceRange) => {
      ToastService.success("Price range added successfully");
      fetchCarManagementData();
    }).catch((err)=>{
      ToastService.error("Error adding price range");
    }).finally(()=>{
      $scope.priceRange = "";
    })
  }

  /**
   * Deletes a car category from the database
   * @param {string} categoryID - ID of the car category to delete
   * @returns {void}
   */
       
  $scope.deleteCarCategory = (categoryID) => {
    console.log(categoryID);
    CarService.deleteCarCategory(categoryID).then(()=>{
      ToastService.success("Car category deleted successfully");
      fetchCarManagementData();
    }).catch((err)=>{
      ToastService.error("Error deleting car category");
    })
  }

  /**
   * Approves a car from the database
   * @param {string} carID - ID of the car to approve
   * @returns {void}
   */
  $scope.approveCar = (carID) => {
    CarService.approveCar(carID).then(()=>{
      ToastService.success("Car approved successfully");
      fetchCarManagementData();
    }).catch((err)=>{
      ToastService.error(`Error approving car ${err}`);
      });
  };


  /**
   * Rejects a car from the database
   * @param {string} carID - ID of the car to reject
   * @returns {void}
   */  
  $scope.rejectCar = (carID) => {
    CarService.rejectCar(carID).then(()=>{
      ToastService.success("Car rejected successfully");
      fetchCarManagementData();
    }).catch((err)=>{
      ToastService.error(`Error rejecting car ${err}`);
      });
  };
});
