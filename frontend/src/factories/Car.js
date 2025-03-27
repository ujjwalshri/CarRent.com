angular.module('myApp').factory('CarFactory', function($q) {
   /**
     * Car Constructor Function
     * @param {string} carName - Name of the car
     * @param {string} company - Car company
     * @param {number} carModel - Model year
     * @param {string} category - Car category
     * @param {number} carPrice - Price of the car
     * @param {number} mileage - Mileage in kmpl
     * @param {string} color - Car color
     * @param {string} fuelType - Type of fuel
     * @param {string} city - City where the car is listed
     * @param {Array} images - Array of image URLs
     */
   function Car(carName, company, carModel, category, carPrice, mileage, color, fuelType, city, images) {
    if (!(this instanceof Car)) {
        return new Car(carName, company, carModel, category, carPrice, mileage, color, fuelType, city, images);
    }

    this.carName = carName;
    this.company = company;
    this.carModel = carModel;
    this.category = category;
    this.carPrice = carPrice;
    this.mileage = mileage;
    this.color = color;
    this.fuelType = fuelType;
    this.city = city;
    this.images = Array.isArray(images) ? images : [];
    this.createdAt = new Date(); // Timestamp for record creation
}

/**
 * Validate the Car object before saving.
 * @returns {Object|Car} - Returns validated car object or an error object.
 */
Car.prototype.validate = function() {
    var errors = [];

    if (!this.carName || typeof this.carName !== 'string') {
        errors.push("Car name is required and must be a string.");
    }

    if (!this.company || typeof this.company !== 'string') {
        errors.push("Company name is required and must be a string.");
    }

    if (!this.carModel || isNaN(this.carModel) || this.carModel < 1886) {
        errors.push("Car model year is required and must be a valid number (>=1886).");
    }

    if (!this.category || typeof this.category !== 'string') {
        errors.push("Car category is required and must be a string.");
    }

    if (isNaN(this.carPrice) || this.carPrice <= 0) {
        errors.push("Car price must be a positive number.");
    }

    if (isNaN(this.mileage) || this.mileage <= 0) {
        errors.push("Mileage must be a positive number.");
    }

    if (!this.color || typeof this.color !== 'string') {
        errors.push("Color is required and must be a string.");
    }

    if (!this.fuelType || typeof this.fuelType !== 'string') {
        errors.push("Fuel type is required and must be a string.");
    }

    if (!this.city || typeof this.city !== 'string') {
        errors.push("City is required and must be a string.");
    }

    if (!Array.isArray(this.images) || this.images.length === 0) {
        errors.push("At least one image URL is required.");
    }

    return errors.length ? { error: errors } : this;
};

/**
 * Factory Object for Car Creation
 */
var factory = {
    /**
     * Creates and validates a new car object.
     * @returns {Object|Car} - Returns either the validated car object or an error object.
     */
    createCar: function(carName, company, carModel, category, carPrice, mileage, color, fuelType, city, images) {
        var car = new Car(carName, company, carModel, category, carPrice, mileage, color, fuelType, city, images);
        return car.validate(); // Validate before returning
    }
};

return factory;
});