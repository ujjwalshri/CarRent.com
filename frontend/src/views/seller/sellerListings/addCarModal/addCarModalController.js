/**
 * Controller for the add car modal in seller listings
 * Based on the same functionality as the addCarController but adapted for modal use
 */
angular.module('myApp').controller('AddCarModalCtrl', function($scope, $uibModalInstance, CarFactory, ToastService, CarService, City, $rootScope, $q) {
    // Initialize variables
    $scope.images = []; // Array to store the car images selected by the user
    $scope.loadingAddCar = false;
    $scope.loadingText = "Saving car...";
    $scope.cities = City.getCities();
    $scope.companies = CarFactory.companies;
    $scope.fuelTypes = CarFactory.fuelTypes;
   
    // initializing the car categories and price ranges
    $scope.minPrice = 0;
    $scope.maxPrice = 0;
    $scope.currentYear = new Date().getFullYear();
    const rgbToHex = CarFactory.rgbToHex;

     // car model variable to bind the form fields
     $scope.car = {
        name: "",
        company: "",
        modelYear: "",
        category: "",
        price: "",
        mileage: "",
        color: "",
        fuelType: "",
        city: "",
        registrationNumber: ""
      }

    


    
   /**
    * @description: this function will be called when the controller is loaded, fetches the car categories and price ranges
    * @param {Object} $scope - AngularJS scope object
    * @param {Object} $q - AngularJS service for handling promises
    * @param {Object} CarService - Service for handling car-related API calls
    * @param {Object} ToastService - Service for displaying toast notifications
    */
    $scope.init = function() {
        $q.all([
            CarService.getAllCarCategories(),
            CarService.getCurrentPriceRanges()
        ]).then(function(results) {
            $scope.carCategories = results[0];
            $scope.minPrice = results[1][0].min;
            $scope.maxPrice = results[1][0].max;
        })
        .catch(function(err) {
            ToastService.error("Error fetching car categories or price ranges: " + err);
        });
    };
    

    
    /**
     * Handle image file selection and prepare for upload
     * Creates the dominant color of the car from the car images to use in the car card
     * @param {Object} input - The file input DOM element 
     */
    $scope.showPreview = function (input) {
        // Use CarFactory's previewCarImages function to process the images
        CarFactory.previewCarImages(input, $scope, rgbToHex);
    };
   
    
    /**
     * @description: this function will be called when the user submits the form, it will create a car object and send it to the server
     * @returns returns a promise that resolves when the car is added successfully or rejects with an error message
     */
    $scope.submitCarForm = function() {
        $scope.loadingAddCar = true;
        
        // Create a car object using the factory with form field values
        const car = CarFactory.createCar({
            name: $scope.car.name,
            company: $scope.car.company,
            modelYear: $scope.car.modelYear,
            category: $scope.car.category,
            price: $scope.car.price,
            mileage: $scope.car.mileage,
            color: $scope.color,
            fuelType: $scope.car.fuelType,
            city: $scope.car.city,
            registrationNumber: $scope.car.registrationNumber,
            vehicleImages: $scope.images
        });
        
        // Validate the car object
        if (typeof car === 'string') {
            ToastService.error(car);
            $scope.loadingAddCar = false;
            return;
        }
        
        // Convert car data to FormData for multipart/form-data submission (for images)
        const formData = car.toFormData();
        
        // Send the car data to the server
        CarService.addCar(formData)
            .then(function(res) {
                 ToastService.success("Car added successfully, please wait for approval");
                $uibModalInstance.close(res);
            })
            .catch(function(err) {
                ToastService.error(` ${err}`);
            })
            .finally(function() {
                $scope.loadingAddCar = false;
            });
    };
    
    /**
     * Close the modal without saving
     */
    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
});