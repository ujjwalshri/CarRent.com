angular.module('myApp').factory('BiddingFactory', function() {
     /**
     * Bid Constructor Function
     * @param {number} amount - The bid amount.
     * @param {Date} startDate - The start date of the bid.
     * @param {Date} endDate - The end date of the bid.
     * @param {Object} owner - The car owner's details.
     */
     function Bid(amount, startDate, endDate, owner) {
        if(!this.instanceOf === Bid){
            return new Bid(amount, startDate, endDate, owner);
        } 
        this.amount = amount;
        this.startDate = new Date(startDate);
        this.endDate = new Date(endDate);
        this.owner = owner;
    }

     /**
     * Validates the bid object.
     * @returns {Object|Bid} - Returns the validated bid object or an error object.
     */
     Bid.prototype.validate = function() {
        console.log(typeof(this.amount));
        if (isNaN(this.amount) || this.amount <= 0 ) {
            return { error: "Bid amount must be a positive number." };
        }
        if(this.amount < 500){
            return { error: "Bid amount must be greater than 500." };
        }
        if(this.amount> 100000){
            return { error: "Bid amount must be less than 100000." };
        }

        if (isNaN(this.startDate.getTime()) || isNaN(this.endDate.getTime())) {
            return { error: "Invalid start or end date." };
        }

        if (this.startDate.setHours(0, 0, 0, 0) > this.endDate.setHours(0, 0, 0, 0)) {
            return { error: "Start date must be before or equal to end date." };
        }

        if (!this.owner || !this.owner._id || !this.owner.username) {
            return { error: "Owner details are missing or incomplete." };
        }

        return this; // If validation passes, return the bid object
    };

      /**
     * Factory Object for Bid Creation
     */
      var factory = {
        /**
         * Creates and validates a new bid.
         * @param {Object} bidData - Raw bid data from $scope
         * @returns {Object|Bid} - Returns either the validated bid object or an error object.
         */
        createBid: function(amount, startDate, endDate, owner) {
            var bid = new Bid(
                amount,
                startDate,
                endDate,
                owner
            );
            console.log(bid);

            return bid.validate(); 
        }
    };

    return factory;
});
