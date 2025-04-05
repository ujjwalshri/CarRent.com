/**
 * Angular factory module for handling Car-related operations
 * This factory provides methods for creating and validating car objects
 */
angular.module('myApp').factory('CarFactory', function() {
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
    function Car(carName, company, carModel, category, carPrice, mileage, color, fuelType, city, images) {
        // Ensure the function is called with 'new' operator
        if (!(this instanceof Car)) {
            return new Car(carName, company, carModel, category, carPrice, mileage, color, fuelType, city, images);
        }

        // Initialize car properties
        this.name = carName;
        this.company = company;
        this.modelYear = carModel;
        this.category = category;
        this.price = carPrice;
        this.mileage = mileage;
        this.color = color;
        this.fuelType = fuelType;
        this.city = city;
        this.images = Array.isArray(images) ? images : [];
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


        // Validate each property with specific rules
        if (!this.name || typeof this.name !== 'string') {
            return  "Car name is required and must be a string.";
        }
        if (!this.company || typeof this.company !== 'string' || this.company.length < 3 || this.company.length > 20) {
            return  "Company name is required and must be a string. and must be between 3 and 20 characters";
        }
        // 1886 is the year when the first car was invented
        if (!this.modelYear || isNaN(this.modelYear) || this.modelYear < 1900 || this.modelYear > new Date().getFullYear()+1) {
            return  "Car model year is required and must be a valid number (>=1900).";
        }
        if (!this.category || typeof this.category !== 'string') {
            return  "Car category is required and must be a string.";
        }
        if (isNaN(this.price) || this.price <= 0) {
            return  "Car price must be a positive number.";
        }
        if (isNaN(this.mileage) || this.mileage <= 0) {
            return  "Mileage must be a positive number.";
        }
        if (!this.color || typeof this.color !== 'string') {
            return  "Color is required and must be a string.";
        }
        if (!this.fuelType || typeof this.fuelType !== 'string') {
            return  "Fuel type is required and must be a string.";
        }
        if (!this.city || typeof this.city !== 'string') {
            return  "City is required and must be a string.";
        }
        if (!Array.isArray(this.images) || this.images.length === 0 || this.images.length>5) {
            return  "Images can be in 1 to 5 range";
        }


        // Return errors if any, otherwise return the car object
        return this;
    };

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
         * Creates and validates a new Car instance from provided data
         * 
         * @param {Object} data - Object containing car properties
         * @returns {Object} - Either a valid Car instance or validation errors
         */
        createCar: function(data) {
            // Create new car instance with provided data
            var car = new Car(
                data.name, data.company, data.modelYear, data.category,
                data.price, data.mileage, data.color, data.fuelType, data.city, data.vehicleImages
            );
            console.log(car);
            
            // Validate the car and return result
            var validation = car.validate();
            if (validation.error) {
                return validation;
            }
            return car;
        }
    };

    return factory;
});
