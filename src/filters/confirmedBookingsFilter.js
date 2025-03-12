angular.module('myApp').filter('confirmedBookingsFilter', function () {
    return function (bookings, startDate) {
        if (!bookings) return [];
        if (!startDate) return bookings; // If no startDate is provided, return all bookings
        
        let filterStartDate = new Date(startDate); // Convert startDate to a Date object
        console.log(filterStartDate);
        return bookings.filter(function (booking) {
            let bookingStartDate = new Date(booking.startDate); // Convert booking startDate to a Date object
            return bookingStartDate >= filterStartDate; // Compare dates
        });
    };
});
