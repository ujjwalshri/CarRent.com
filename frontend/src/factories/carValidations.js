angular.module('myApp').factory('carValidation', function($q) {
    return {
        // function to validate the car object
        validateCar: function(car) {
            if (car.carName.trim().length < 3) { // check if the car name is less than 3 characters
               return {success:false, message:"Car name should be atleast 3 characters long"};
            }
            if (car.carPrice < 0) { // check if the car price is less than 0
                return {success:false, message:"Car price should be greater than 0"};
            } 
            if (car.carPrice > 10000 || car.carPrice < 500) { // check if the car price is between 500 and 10000
               return {success:false, message:"Car price should be between 500 and 10000"};
            }
            if (car.carModel < 1900 || car.carModel > new Date().getFullYear()) { // check if the car model is between 1900 and current year
               return {success:false, message:"Car model should be between 1900 and current year"};
            }
            if (car.mileage < 0 || car.mileage>500) { // check if the car mileage is between 0 and 500
               return {success:false, message:"Car mileage should be between 0 and 500"};
            }
            if (car.vehicleImages.length < 1) { // check if the car has atleast 1 image
               return {success:false, message:"Please upload atleast 1 image of the car"};
            }
            if (car.vehicleImages.length > 5) { // check if the car has more than 5 images
               return {success:false, message:"Please upload upto 5 images of the car"};
            }
          
            return {success:true, message:"Car validated successfully"}; // return true if the car is validated
        },

        /*
        function to validate the car schema
        params: car object
        returns: boolean
        */ 
        validateCarSchema: function(car) {
            // check if car object has all the required properties
        const requiredFields = ["carType", "carName", "carModel", "category", "location", "carPrice", "mileage"];
          for (let field of requiredFields) {
             if (!car[field]) { // check if the field is present in the car object
                 return false;
             }
        }
            return true;
        }
    };
});