angular
  .module("myApp")
  .controller("addCarCtrl", function ($scope, $timeout,CarFactory, ToastService, CarService, City, $rootScope, $q, $state) {
    // Array to store the car images selected by the user
    $scope.images = []; 
    // Flag to track loading state during form submission
    $scope.isLoading = false;
    // Flag to control visibility of car form (initially false to show info first)
    $scope.showCarForm = false;
    // Get available cities from the City service
    $scope.cities = City.getCities(); 
    $scope.companies = CarFactory.companies;
    $scope.fuelTypes = CarFactory.fuelTypes;
    $scope.locations = CarFactory.locationTypes;
    $scope.minPrice = 0;
    $scope.maxPrice = 0;

    const rgbToHex = CarFactory.rgbToHex;

    // Get current year for model year validation
    $scope.currentYear = new Date().getFullYear();

    
    /**
     * Initializes the add car controller by fetching required configuration data
     * 
     * @function init
     * @description
     * Makes parallel API calls using $q.all() to fetch:
     * 1. All car categories available for admin from CarService
     * 2. Current configured price ranges from CarService
     * 
     * Updates the following scope variables:
     * - carCategories: Array of available car categories that can be assigned to new cars
     * - minPrice: Minimum allowed price for a car rental (from price range config)
     * - maxPrice: Maximum allowed price for a car rental (from price range config)
     * 
     * This initialization ensures the add car form has all necessary dropdown options
     * and price validation boundaries before allowing car creation.
     */
    $scope.init = function(){
       $q.all([
        CarService.getAllCarCategoriesForAdmin(),
        CarService.getCurrentPriceRanges()
       ]).then(([carCategories, priceRanges])=>{
        $scope.carCategories = carCategories;
        $scope.minPrice = priceRanges[0].min;
        $scope.maxPrice = priceRanges[0].max;
       }).catch((err)=>{
        ToastService.error("Error fetching car categories or price ranges: " + err);
       })
    }

    /**
     * Handle image file selection and prepare for upload creates the dominant color of the car from the car images to use in the car card
     * @param {Object} input - The file input DOM element 
     */
    $scope.showPreview = function (input){
       CarFactory.previewCarImages(input, $scope, rgbToHex);
    }
   
    /**
     * Submit the car form and create a new car listing
     * Validates inputs, creates a car object, and sends to server
     */
    $scope.submitCarForm = function () {
      $scope.isLoading = true;
      // Create a car object using the factory with form field values also validates the car object fields
      const car = CarFactory.createCar({
        name: $scope.carName, 
        company: $scope.company, 
        modelYear: $scope.carModel, 
        category: $scope.category, 
        price: $scope.carPrice, 
        mileage: $scope.mileage, 
        color: $scope.color,
        fuelType: $scope.fuelType,
        location: $scope.location,
        city: $scope.city,
        registrationNumber: $scope.registrationNumber,
        vehicleImages: $scope.images
      });
      
      // check if the car is an error string returned from the factory
      if(typeof car === "string"){
        ToastService.error(car);
        $scope.isLoading = false;
        return;
      }

      // Convert car data to FormData for multipart/form-data submission (for images)
      const formData = car.toFormData();
      
      // Send the car data to the server
      CarService.addCar(formData)
          .then((res) => {
              ToastService.success("Car added successfully, please wait for approval");
              $state.reload();
          })
          .catch((err) => {
              ToastService.error(`Error adding car: ${err}`);
          }).finally(() => {  
            // Reset form fields after submission (success or failure)
            $scope.carName = "";
            $scope.company = "";
            $scope.carModel = "";
            $scope.category = "";
            $scope.location = "";
            $scope.carPrice = "";
            $scope.mileage = "";
            $scope.color = "";
            $scope.fuelType = "";
            $scope.city = "";
            $scope.registrationNumber = "";
            $scope.images = []; 
            $scope.isLoading = false;
            
          });
  }
});