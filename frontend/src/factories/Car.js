/**
 * Angular factory module for handling Car-related operations
 * This factory provides methods for creating and validating car objects
 */
angular.module('myApp').factory('CarFactory', function(CarService, $q, $timeout) {
    /**
     * Car Constructor Function
     * Creates a new Car object with the specified properties
     * 
     * @param {string} carName - Name of the car
     * @param {string} company - Manufacturing company name
     * @param {number} carModel - Year model of the car
     * @param {string} category - Category of the car (e.g., SUV, Sedan)
     * @param {number} carPrice - Price of the car per day
     * @param {number} mileage - Mileage of the car in kmpl
     * @param {string} color - Color of the car
     * @param {string} fuelType - Type of fuel used (e.g., Petrol, Diesel)
     * @param {string} city - City where the car is available
     * @param {Array} images - Array of image URLs for the car
     * @returns {Car} - New Car instance
     */
    function Car(carName, company, carModel, category, carPrice, mileage, color, fuelType,location, city, images, registrationNumber) {
        // Ensure the function is called with 'new' operator
        if (!(this instanceof Car)) {
            return new Car(carName, company, carModel, category, carPrice, mileage, color, fuelType,location, city, images, registrationNumber);
        }

        // Initialize car properties
        this.name = carName ? carName.trim() : null;
        this.company = company ? company.trim() : null;
        this.modelYear = carModel ? carModel : null;
        this.category = category ? category.trim() : null;
        this.price = carPrice ? carPrice : null;
        this.mileage = mileage? mileage : null;
        this.color = color ? color.trim() : null;
        this.fuelType = fuelType? fuelType : null;
        this.location = location ? location.trim() : null;
        this.city = city ? city : null;
        this.images = Array.isArray(images) ? images : [];
        this.registrationNumber = registrationNumber ? registrationNumber : null;
    }


   

    /**
     * Validate the Car object properties
     * Checks if all required fields are present and have valid values
     * 
     * @returns {Object} - Returns either:
     *                     - The valid car object if validation passes
     *                     - An object with error array if validation fails
     */
    Car.prototype.validate = function() {
        console.log(this);
        const registrationNumberRegex = /^[A-Z|a-z]{2}\s?[0-9]{1,2}\s?[A-Z|a-z]{0,3}\s?[0-9]{4}$/;

        // Validate each property with specific rules
        if (!this.name || typeof this.name !== 'string') {
            return "Car name is required and must be a string.";
        }
        if (!this.company || typeof this.company !== 'string' || this.company.length < 3 || this.company.length > 20) {
            return "Company name is required and must be a string. and must be between 3 and 20 characters";
        }
        if (!this.modelYear || isNaN(this.modelYear) || this.modelYear < 1900 || this.modelYear > new Date().getFullYear()+1) {
            return "Car model year is required and must be a valid number (>=1900).";
        }
        if (!this.category || typeof this.category !== 'string') {
            return "Car category is required and must be a string.";
        }
        if (isNaN(this.mileage) || this.mileage <= 0) {
            return "Mileage must be a positive number.";
        }
        if (!Array.isArray(this.images) || this.images.length === 0 ) {
            return "At least one image is required.";
        }
        if (!this.color || typeof this.color !== 'string') {
            return "Color is required and must be a string.";
        }
        if (!this.fuelType || typeof this.fuelType !== 'string') {
            return "Fuel type is required and must be a string.";
        }
        if(this.location && typeof this.location !== 'string'){
            return "Location is required and must be a string.";
        }
        if (!this.city || typeof this.city !== 'string') {
            return "City is required and must be a string.";
        }
       
        if(this.registrationNumber && typeof this.registrationNumber !== 'string'){
            return "Registration number is required and must be a string.";
        }
       
        if(this.registrationNumber && !registrationNumberRegex.test(this.registrationNumber)){
            return "Registration number is not valid";
        }
       
        // Return errors if any, otherwise return the car object
        return this;
    };
     /**
     * Convert the Car object properties to FormData
     * @returns {Object} - Returns FormData object
     */
    Car.prototype.toFormData = function(){
        const formData = new FormData();
      formData.append('name', this.name);
      formData.append('company', this.company);
      formData.append('modelYear', this.modelYear);
      formData.append('category', this.category);
      formData.append('price', this.price);
      formData.append('mileage', this.mileage);
      formData.append('location', this.location);
      formData.append('color', this.color);
      formData.append('fuelType', this.fuelType);
      formData.append('city', this.city);
      formData.append('registrationNumber', this.registrationNumber);
      for(let image of this.images){
        formData.append('images', image);
      }
        return formData;
    }
    



    /**
     * Factory Object for Car Creation
     * Provides methods to create and validate car instances
     */
    var factory = {
        /**
         * Get current price range
         * @returns {Object} Current price range {min, max}
         */
        getPriceRange: function() {
            let deferred = $q.defer();
            CarService.getCurrentPriceRanges().then((ranges)=>{
                console.log(ranges);
                deferred.resolve(ranges[0]);
            }).catch((error)=>{
                deferred.reject(error);
            });
            return deferred.promise;
        },
  

        /**
         * Creates and validates a new Car instance from provided data
         * 
         * @param {Object} data - Object containing car properties
         * @returns {Object} - Either a valid Car instance or validation errors
         */
        createCar: function(data) {
            // Create new car instance with provided data
            var car = new Car(
                data.name, data.company, data.modelYear, data.category,
                data.price, data.mileage, data.color, data.fuelType, data.location, data.city, data.vehicleImages, data.registrationNumber
            );
            
            console.log("Created car object:", car);
            
            // Validate the car and return result
            var validation = car.validate();
            console.log("Validation result:", validation);
            
            if (typeof validation === 'string') {
                return validation;
            }
            return car;
        },
        companies: [
            "Maruti Suzuki",
            "Hyundai",
            "Tata Motors",
            "Mahindra",
            "Honda",
            "Toyota",
            "Kia",
            "Skoda",
            "Volkswagen",
            "Renault",
            "Nissan",
            "MG (Morris Garages)",
            "Citroën",
            "Jeep",
            "Ford" , 
            "Fiat", 
            "Datsun", 
            "Lexus",
            "Mercedes-Benz",
            "BMW",
            "Audi",
            "Jaguar",
            "Land Rover",
            "Porsche",
            "Volvo",
            "Mini",
            "Rolls-Royce",
            "Bentley",
            "Lamborghini",
            "Ferrari",
            "Aston Martin",
            "Isuzu",
            "BYD",
            "Tesla", 
            "Force Motors",
            "Ashok Leyland", 
            "Eicher Motors",
            "Premier", 
            "Hindustan Motors",
            "Opel", 
            "Tata",
            "Daewoo", 
            "SsangYong",
            "Reva", 
        ].sort(),
        fuelTypes: [
            'Petrol',
            'Diesel',
            'Hybrid',
            'Gasoline',
            'Electric',
        ],
        locationTypes: [
            'Local',
            'Outstation',
        ],

    

        /**
         * Get array of price ranges for filtering
         * @returns {Array} Array of price range strings
         */
        getPriceRangeArray: function(min , max) {

            const priceRangeArray = [];
            const step = 500;
            for(let i = min; i <= max; i += step) {
                priceRangeArray.push(`${i}-${Math.min(i + step, max)}`);
            }
            return priceRangeArray;
        },

        validateUpdateCity: function(city){
            if(!city || typeof city !== 'string'){
                return "City is required and must be a string.";
            }
            return true;
        },

         rgbToHex(r, g, b) {
            return "#" + [r, g, b].map(x => {
              const hex = x.toString(16);
              return hex.length === 1 ? "0" + hex : hex;
            }).join('');
          },

        previewCarImages: function(input, $scope, rgbToHex) {
            if (input.files) {
                let files = Array.from(input.files);
              
        
                // Validation: Max 5 files
                if (files.length > 5 ) {
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
                  reader.onload = function (e) {
                      $scope.imagePreviews[index] = e.target.result;
                      
                    // calculating the color from the first image
                    if (index === 0) {
                      const img = new Image();
                      img.crossOrigin = 'anonymous';
                      img.src = e.target.result;
            
                      img.onload = function () {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
            
                        canvas.width = img.naturalWidth;  // Set the width of the canvas to the natural width of the image
                        canvas.height = img.naturalHeight; // Set the height of the canvas to the natural height of the image
            
                        ctx.drawImage(img, 0, 0); // Draw the image on the canvas
                        const centerX = Math.floor(canvas.width / 2); // Calculate the center of the canvas
                        const centerY = Math.floor(canvas.height / 2); // Calculate the center of the canvas
                        const pixelData = ctx.getImageData(centerX, centerY, 1, 1).data; // Get the pixel data of the center of the image
                        $scope.color = rgbToHex(pixelData[0], pixelData[1], pixelData[2]); // Convert the pixel data to a hex color
                        $timeout();
                      };
                    }
                  };
            
                  reader.readAsDataURL(file);
                });
            
                $timeout(); // Trigger digest
              }
        }

    };



    return factory;
});
