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
    $scope.locations = CarFactory.locationTypes;
    $scope.minPrice = 0;
    $scope.maxPrice = 0;
    $scope.currentYear = new Date().getFullYear();
    const rgbToHex = CarFactory.rgbToHex;
    
   /**
    * Initializes the add car modal by fetching required configuration data
    */
    $scope.init = function() {
        $q.all([
            CarService.getAllCarCategoriesForAdmin(),
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
     * Submit the car form and create a new car listing
     * Validates inputs, creates a car object, and sends to server
     */
    $scope.submitCarForm = function() {
        $scope.loadingAddCar = true;
        
        // Create a car object using the factory with form field values
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