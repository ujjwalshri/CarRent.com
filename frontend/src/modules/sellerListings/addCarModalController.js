/**
 * Controller for the add car modal in seller listings
 * Based on the same functionality as the addCarController but adapted for modal use
 */
angular.module('myApp').controller('AddCarModalCtrl', function($scope, $uibModalInstance, $timeout, CarFactory, ToastService, CarService, City, $rootScope, $q) {
    // Initialize variables
    $scope.images = []; // Array to store the car images selected by the user
    $scope.isLoading = false;
    $scope.cities = City.getCities();
    $scope.companies = CarFactory.companies;
    $scope.fuelTypes = CarFactory.fuelTypes;
    $scope.locations = CarFactory.locationTypes;
    $scope.minPrice = 0;
    $scope.maxPrice = 0;
    $scope.currentYear = new Date().getFullYear();
    
    /**
     * Initializes the modal controller by fetching required data
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
    
    // Initialize when the controller loads
    
    
    /**
     * Handle image file selection and prepare for upload
     * Creates the dominant color of the car from the car images to use in the car card
     * @param {Object} input - The file input DOM element 
     */
    $scope.previewImages = function(input) {
        if (input.files) {
            let files = Array.from(input.files);
            
            // Validation: Max 5 files
            if (files.length > 5) {
                $scope.imageError = 'You can only upload 1 to 5 images';
                input.value = '';
                $scope.images = [];
                $scope.imagePreviews = [];
                $scope.imageColor = null;
                $timeout();
                return;
            }
            
            // Validation: Allowed types
            const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
            const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));
            
            if (invalidFiles.length > 0) {
                $scope.imageError = 'Only JPG, JPEG, PNG and WebP images are allowed';
                input.value = '';
                $scope.images = [];
                $scope.imagePreviews = [];
                $scope.imageColor = null;
                $timeout();
                return;
            }
            
            // Validation: File size < 5MB
            const maxSize = 5 * 1024 * 1024;
            const oversizedFiles = files.filter(file => file.size > maxSize);
            
            if (oversizedFiles.length > 0) {
                $scope.imageError = 'Each image must be less than 5MB';
                input.value = '';
                $scope.images = [];
                $scope.imagePreviews = [];
                $scope.imageColor = null;
                $timeout();
                return;
            }
            
            // Clear errors and initialize
            $scope.imageError = null;
            $scope.images = files;
            $scope.imagePreviews = [];
            $scope.imageColor = null;
            
            // Handle image previews
            files.forEach((file, index) => {
                const reader = new FileReader();
                reader.onload = function(e) {
                    $scope.imagePreviews[index] = e.target.result;
                    
                    // calculating the color from the first image
                    if (index === 0) {
                        const img = new Image();
                        img.crossOrigin = 'anonymous';
                        img.src = e.target.result;
                        
                        img.onload = function() {
                            const canvas = document.createElement('canvas');
                            const ctx = canvas.getContext('2d');
                            
                            canvas.width = img.naturalWidth;
                            canvas.height = img.naturalHeight;
                            
                            ctx.drawImage(img, 0, 0);
                            const centerX = Math.floor(canvas.width / 2);
                            const centerY = Math.floor(canvas.height / 2);
                            const pixelData = ctx.getImageData(centerX, centerY, 1, 1).data;
                            $scope.color = rgbToHex(pixelData[0], pixelData[1], pixelData[2]);
                            $timeout();
                        };
                    }
                };
                
                reader.readAsDataURL(file);
            });
            
            $timeout(); // Trigger digest
        }
    };
    
    // Utility: RGB to HEX
    function rgbToHex(r, g, b) {
        return "#" + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        }).join('');
    }
    
    /**
     * Submit the car form and create a new car listing
     * Validates inputs, creates a car object, and sends to server
     */
    $scope.submitCarForm = function() {
        $scope.isLoading = true;
        
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
            $scope.isLoading = false;
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
                ToastService.error(`Error adding car: ${err}`);
            })
            .finally(function() {
                $scope.isLoading = false;
            });
    };
    
    /**
     * Close the modal without saving
     */
    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
});