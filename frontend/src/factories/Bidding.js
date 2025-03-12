angular.module('myApp').factory('Bidding', function() {
    return {
        /*
        function to check if a bidding is valid or not
        params: bidding object
        returns: object with success and message
        */
        isValidBid: function(bidding) {
         
            if (!bidding.startDate || !bidding.endDate) {
                return { success: false, message: "Please select a valid date range." };
            }
            if(bidding.amount < bidding.vehicle.carPrice){
                return { success: false, message: "Bid amount should be greater than the car price." };
            }
            if(bidding.location === "" || bidding.location !== bidding.vehicle.location){
                return { success: false, message: "Please enter a valid location." };
            }
            // check if only the start date date itself is less than the date of today like 23feb < 24 feb
            return { success: true };
        },
        /*
        function to validate the bidding schema
        params: bidding object
        returns: boolean
        */
        validateBiddingSchema : function(bidding){
            const requiredFields = ["startDate", "endDate", "amount", "location"];
            for(let field of requiredFields){
                if(!bidding[field]){
                    return false;
                }
            }
            return true;
        }
    };
});
