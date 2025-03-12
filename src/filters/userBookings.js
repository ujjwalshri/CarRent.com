angular.module('myApp').filter('userBookingsFilter', function () {
    return function (bookings, searchCarName) {
        if (!bookings) return []; // If no bookings are provided, return an empty array
        return bookings.filter(function (booking) {
            let matchesCarName = !searchCarName || booking.vehicle.carName.toLowerCase().includes(searchCarName.toLowerCase()); // Check if the search string is included in the car name
            return  matchesCarName;  // return true or false;
        });
       
    };
});