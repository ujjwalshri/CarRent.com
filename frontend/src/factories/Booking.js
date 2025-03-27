app.factory('Booking', function(){
    return {
        /*
        function to calculate the total price of a booking
        @params {string} startDate - start date of the booking
        @params {string} endDate - end date of the booking
        @params {number} carPrice - price of the car
        @returns {number} - total price of the booking
        */
        calculate: function(startDate, endDate, carPrice){
            if (!startDate || !endDate || isNaN(carPrice)) {
                return 0; // Return 0 if any value is invalid
            }
           
            // Convert to Date objects
            var start = new Date(startDate);
            var end = new Date(endDate);
            
            // Calculate difference in days
            var diffTime = end.getTime() - start.getTime();
            var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            // Ensure positive number of days
            if (diffDays < 0) {
                return 0;
            }
            var totalPrice = (diffDays+1) * carPrice;
            return totalPrice;
        },

        /*
        function to check if a booking is for to be managed today
        @params {object} booking - booking object
        @returns {boolean} - true if the booking is for today, false otherwise
        */
        todayBookingCalculator: function(booking){
            const bookingStartDate = new Date(booking.startDate); // convert startDate to Date object
            const bookingEndDate = new Date(booking.endDate); // convert endDate to Date object
            const today = new Date(); // get the current date
            today.setHours(0, 0, 0, 0); // set the hours to 0
            bookingStartDate.setHours(0, 0, 0, 0); // set the hours to 0
            bookingEndDate.setHours(23, 59, 59, 999); // set the hours to 23
            return today >= bookingStartDate && today <= bookingEndDate;// check if the booking can be for today
          }
    };
});
