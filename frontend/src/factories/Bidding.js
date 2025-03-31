angular.module('myApp').factory('BiddingFactory', function() {
    /**
     * Bid Constructor Function
     * @param {string} _id - Unique identifier for the bid.
     * @param {number} amount - The bid amount.
     * @param {Date} startDate - The start date of the bid.
     * @param {Date} endDate - The end date of the bid.
     * @param {Object} from - The bidder details.
     * @param {Object} vehicle - The vehicle being bid on.
     * @param {Object} owner - The car owner's details.
     * @param {number} startOdometerValue - Odometer value at start.
     * @param {number} endOdometerValue - Odometer value at end.
     * @param {string} status - The status of the bid.
     * @param {Date} createdAt - Timestamp of bid creation.
     * @param {Date} updatedAt - Timestamp of the last update.
     */
    function Bid(
        _id = null,
        amount = null,
        startDate = null,
        endDate = null,
        from = null,
        vehicle = null,
        owner = null,
        startOdometerValue = null,
        endOdometerValue = null,
        status = "pending",
    ) {
        if (!(this instanceof Bid)) {
            return new Bid(
                _id, amount, startDate, endDate, from, vehicle, owner,
                startOdometerValue, endOdometerValue, status, createdAt, updatedAt
            );
        }

        this._id = _id;
        this.amount = amount;
        this.startDate = startDate ? new Date(startDate) : null;
        this.endDate = endDate ? new Date(endDate) : null;
        this.from = from || null;
        this.vehicle = vehicle || null;
        this.owner = owner || null;
        this.startOdometerValue = startOdometerValue ? startOdometerValue : -1;
        this.endOdometerValue = endOdometerValue ? endOdometerValue : -1;
        this.status = status;
    }

    /**
     * Validates the bid object.
     * @returns {Object|Bid} - Returns the validated bid object or an error object.
     */
    Bid.prototype.validate = function() {
        if (this.amount === null || isNaN(this.amount) || this.amount <= 0) {
            return { error: "Bid amount must be a positive number." };
        }
        if (this.amount < 500) {
            return { error: "Bid amount must be greater than 500." };
        }
        if (this.amount > 100000) {
            return { error: "Bid amount must be less than 100000." };
        }

        if (!this.startDate || isNaN(this.startDate.getTime()) || !this.endDate || isNaN(this.endDate.getTime())) {
            return { error: "Invalid start or end date." };
        }

        if (this.startDate.setHours(0, 0, 0, 0) > this.endDate.setHours(0, 0, 0, 0)) {
            return { error: "Start date must be before or equal to end date." };
        }

        if (!this.owner || !this.owner._id || !this.owner.username) {
            return { error: "Owner details are missing or incomplete." };
        }

        if (this.from && (!this.from._id || !this.from.username)) {
            return { error: "Bidder details are missing or incomplete." };
        }

        if (this.vehicle && (!this.vehicle._id || !this.vehicle.model)) {
            return { error: "Vehicle details are missing or incomplete." };
        }

        if (this.startOdometerValue !== null && (isNaN(this.startOdometerValue) )) {
            return { error: "Invalid start odometer value." };
        }

        if (
            this.endOdometerValue !== null &&
            (isNaN(this.endOdometerValue) || this.endOdometerValue < this.startOdometerValue)
        ) {
            return { error: "End odometer value must be greater than or equal to start odometer value." };
        }

        const validStatuses = ["pending", "accepted", "rejected"];
        if (!validStatuses.includes(this.status)) {
            return { error: "Invalid bid status." };
        }

        return this; // If validation passes, return the bid object
    };
    /**
     * calculate the blocked dates for the bids
     * @param {Array} results - Unique identifier for the bid.
     */
    Bid.prototype.calculateBlockedDates = function(results){
        return results[1]
        .filter(
          (bid) => bid.status === "approved" || bid.status === "reviewed"
        )
        .flatMap((bid) =>
          this.getDatesBetween(new Date(bid.startDate), new Date(bid.endDate))
        );
    }
    /**
     * get the dates between two dates
     * @param {Date} startDate - start date
     * @param {Date} endDate - end date
     * @returns {Array} - Returns the dates between the two dates
     */
    Bid.prototype.getDatesBetween = function(startDate, endDate){
        var dates = [];
        var currentDate = startDate;
        while (currentDate <= endDate) {
            dates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return dates;
    }
    /**
     * calculate the booking price
     * @returns {number} - Returns the booking price
     */
    Bid.prototype.calculate = function(){
        this.startDate = new Date(this.startDate).setHours(0, 0, 0, 0);
        this.endDate = new Date(this.endDate).setHours(0, 0, 0, 0);
        var diffTime = this.endDate - this.startDate;
        var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return (diffDays+1) * this.amount;
    }
    /**
     * Generates and prints a PDF for the booking
     * @method generatePDF
     */
    Bid.prototype.generatePDF = function() {
        // Calculate total distance traveled
        const totalDistance = this.endOdometerValue - this.startOdometerValue;
        
        // Calculate extra distance fee (if distance > 300km)
        const extraDistanceFee = totalDistance > 300 
            ? (totalDistance - 300) * 10  // Charge $10 per km over 300km
            : 0;

        // Calculate base booking price using the booking duration and daily rate
        const basePrice = this.calculate();
        
        // Calculate total amount including extra distance fee
        const totalAmount = basePrice + extraDistanceFee;

        // Define the PDF document structure
        var docDefinition = {
            content: [
                { text: 'Booking Details', style: 'header' },
                { text: 'Booking ID: ' + this._id },
                { text: 'Car: ' + this.vehicle.company + ' ' + this.vehicle.name + ' ' + this.vehicle.modelYear },
                { text: 'Owner: ' + this.owner.username },
                { text: 'Name: ' + this.owner.firstName + ' ' + this.owner.lastName },
                { text: 'Start Date: ' + new Date(this.startDate).toLocaleDateString() },
                { text: 'End Date: ' + new Date(this.endDate).toLocaleDateString() },
                { text: 'Start Odometer Value: ' + this.startOdometerValue + ' km' },
                { text: 'End Odometer Value: ' + this.endOdometerValue + ' km' },
                { text: 'Daily Rate: $' + this.amount },
                { text: 'Base Price: $' + basePrice },
                { 
                    text: 'Extra Distance Fee: $' + extraDistanceFee + 
                          (extraDistanceFee > 0 ? ' (' + (totalDistance - 300) + ' km over limit)' : '')
                },
                { text: 'Total Amount: $' + totalAmount, style: 'total' }
            ],
            styles: {
                header: {
                    fontSize: 30,
                    bold: true,
                    margin: [0, 10, 0, 10]
                },
                total: {
                    fontSize: 20,
                    bold: true,
                    margin: [0, 10, 0, 0]
                }
            }
        };

        // Generate and print the PDF
        pdfMake.createPdf(docDefinition).print();
    };
    Bid.prototype.todayBookingCalculator = function(){
        const bookingStartDate = new Date(this.startDate).setHours(0, 0, 0, 0);
        const bookingEndDate = new Date(this.endDate).setHours(23, 59, 59, 999);
        const today = new Date();
        return today >= bookingStartDate && today <= bookingEndDate;
    }
    
   
    /**
     * Factory Object for Bid Creation
     */
    var factory = {
        /**
         * Creates and validates a new bid.
         * @param {Object} data - Raw bid data (can include any properties)
         * @returns {Object|Bid} - Returns either the validated bid object or an error object.
         */
        createBid: function(data = {}, toValidate=true) {
            var bid = new Bid(
                data._id,
                data.amount,
                data.startDate,
                data.endDate,
                data.from,
                data.vehicle,
                data.owner,
                data.startOdometerValue,
                data.endOdometerValue,
                data.status,
            );
            if(toValidate) {
                return bid.validate();
            }
            return bid;
        },
         /**
         * Calculates the booking price and validates a new bid.
         * @param {Object} data - Raw bid data (can include any properties)
         * @returns {Object|Bid} - Returns either the validated bid object or an error object.
         */
        calculateBlockedDates: function(results){
            var bid = new Bid();
            return bid.calculateBlockedDates(results);
        },
        convertResponceToBidObject: function(responseArray) {
            var bids = responseArray.map(function(response) {
                return new Bid(
                    response._id,
                    response.amount,
                    response.startDate,
                    response.endDate,
                    response.from,
                    response.vehicle,
                    response.owner,
                    response.startOdometerValue,
                    response.endOdometerValue,
                    response.status
                );
            });
            return bids;
        },
        calculate : function(startDate, endDate, amount){
            startDate = new Date(startDate).setHours(0, 0, 0, 0);
            endDate = new Date(endDate).setHours(0, 0, 0, 0);
            var diffTime = endDate - startDate;
            var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return (diffDays+1) * amount;
        }
    };
    return factory;
});
