angular.module('myApp').factory('BiddingFactory', function($timeout) {
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
        this.startOdometerValue = startOdometerValue !== null ? startOdometerValue : -1;
        this.endOdometerValue = endOdometerValue !== null ? endOdometerValue : -1;
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
            pageSize: 'A4',
            pageMargins: [40, 40, 40, 40],
            content: [
                // Header Section
                {
                    columns: [
                        {
                            width: '*',
                            text: 'CAR RENTAL INVOICE',
                            style: 'header',
                            alignment: 'left'
                        },
                        {
                            width: 'auto',
                            text: new Date().toLocaleDateString(),
                            style: 'date',
                            alignment: 'right'
                        }
                    ]
                },
                {
                    canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 1, lineColor: '#aaa' }]
                },
                { text: '\n' },
                
                // Company Info
                {
                    columns: [
                        {
                            width: '*',
                            stack: [
                                { text: 'CAR RENTAL COMPANY', style: 'companyName' },
                                { text: '123 Rental Street', style: 'companyAddress' },
                                { text: 'City, State 12345', style: 'companyAddress' },
                                { text: 'Phone: (123) 456-7890', style: 'companyAddress' },
                                { text: 'Email: info@carrental.com', style: 'companyAddress' }
                            ]
                        },
                        {
                            width: 'auto',
                            stack: [
                                { text: 'Invoice #: ' + this._id, style: 'invoiceNumber' },
                                { text: 'Date: ' + new Date().toLocaleDateString(), style: 'invoiceDate' }
                            ]
                        }
                    ]
                },
                { text: '\n\n' },

                // Booking Details Section
                {
                    stack: [
                        { text: 'Booking Details', style: 'sectionHeader' },
                        {
                            table: {
                                headerRows: 1,
                                widths: ['*', '*'],
                                body: [
                                    [
                                        { text: 'Car Details', style: 'tableHeader' },
                                        { text: 'Customer Details', style: 'tableHeader' }
                                    ],
                                    [
                                        {
                                            stack: [
                                                { text: this.vehicle.company + ' ' + this.vehicle.name + ' ' + this.vehicle.modelYear, style: 'tableContent' },
                                                { text: 'Model Year: ' + this.vehicle.modelYear, style: 'tableContent' }
                                            ]
                                        },
                                        {
                                            stack: [
                                                { text: this.owner.firstName + ' ' + this.owner.lastName, style: 'tableContent' },
                                                { text: this.owner.username, style: 'tableContent' }
                                            ]
                                        }
                                    ]
                                ]
                            }
                        }
                    ]
                },
                { text: '\n' },

                // Rental Period Section
                {
                    stack: [
                        { text: 'Rental Period', style: 'sectionHeader' },
                        {
                            table: {
                                headerRows: 1,
                                widths: ['*', '*'],
                                body: [
                                    [
                                        { text: 'Start Date', style: 'tableHeader' },
                                        { text: 'End Date', style: 'tableHeader' }
                                    ],
                                    [
                                        { text: new Date(this.startDate).toLocaleDateString(), style: 'tableContent' },
                                        { text: new Date(this.endDate).toLocaleDateString(), style: 'tableContent' }
                                    ]
                                ]
                            }
                        }
                    ]
                },
                { text: '\n' },

                // Odometer Readings Section
                {
                    stack: [
                        { text: 'Odometer Readings', style: 'sectionHeader' },
                        {
                            table: {
                                headerRows: 1,
                                widths: ['*', '*'],
                                body: [
                                    [
                                        { text: 'Start Reading', style: 'tableHeader' },
                                        { text: 'End Reading', style: 'tableHeader' }
                                    ],
                                    [
                                        { text: this.startOdometerValue + ' km', style: 'tableContent' },
                                        { text: this.endOdometerValue + ' km', style: 'tableContent' }
                                    ]
                                ]
                            }
                        }
                    ]
                },
                { text: '\n' },

                // Cost Breakdown Section
                {
                    stack: [
                        { text: 'Cost Breakdown', style: 'sectionHeader' },
                        {
                            table: {
                                headerRows: 1,
                                widths: ['*', 'auto'],
                                body: [
                                    [
                                        { text: 'Description', style: 'tableHeader' },
                                        { text: 'Amount', style: 'tableHeader' }
                                    ],
                                    [
                                        { text: 'Daily Rate', style: 'tableContent' },
                                        { text: '$' + this.amount, style: 'tableContent' }
                                    ],
                                    [
                                        { text: 'Base Price', style: 'tableContent' },
                                        { text: '$' + basePrice, style: 'tableContent' }
                                    ],
                                    [
                                        { 
                                            text: 'Extra Distance Fee' + 
                                                  (extraDistanceFee > 0 ? ' (' + (totalDistance - 300) + ' km over limit)' : ''),
                                            style: 'tableContent'
                                        },
                                        { text: '$' + extraDistanceFee, style: 'tableContent' }
                                    ],
                                    [
                                        { text: 'Total Amount', style: 'totalLabel' },
                                        { text: '$' + totalAmount, style: 'totalAmount' }
                                    ]
                                ]
                            }
                        }
                    ]
                },
                { text: '\n\n' },

                // Footer
                {
                    columns: [
                        {
                            width: '*',
                            text: 'Thank you for choosing our service!',
                            style: 'footer'
                        }
                    ]
                }
            ],
            styles: {
                header: {
                    fontSize: 24,
                    bold: true,
                    color: '#2c3e50',
                    margin: [0, 0, 0, 10]
                },
                date: {
                    fontSize: 12,
                    color: '#7f8c8d'
                },
                companyName: {
                    fontSize: 18,
                    bold: true,
                    color: '#2c3e50',
                    margin: [0, 0, 0, 5]
                },
                companyAddress: {
                    fontSize: 10,
                    color: '#7f8c8d',
                    margin: [0, 0, 0, 2]
                },
                invoiceNumber: {
                    fontSize: 14,
                    bold: true,
                    color: '#2c3e50'
                },
                invoiceDate: {
                    fontSize: 12,
                    color: '#7f8c8d'
                },
                sectionHeader: {
                    fontSize: 16,
                    bold: true,
                    color: '#2c3e50',
                    margin: [0, 10, 0, 5]
                },
                tableHeader: {
                    fontSize: 12,
                    bold: true,
                    color: '#2c3e50',
                    fillColor: '#f8f9fa'
                },
                tableContent: {
                    fontSize: 11,
                    color: '#34495e'
                },
                totalLabel: {
                    fontSize: 14,
                    bold: true,
                    color: '#2c3e50'
                },
                totalAmount: {
                    fontSize: 14,
                    bold: true,
                    color: '#27ae60'
                },
                footer: {
                    fontSize: 10,
                    color: '#7f8c8d',
                    italics: true
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
            console.log("Bid Object:", bid);
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
        },
        initializeFlatpickr: function(blockedDates, htmlElementId, $scope){
            flatpickr(htmlElementId, {
                mode: "range",
                dateFormat: "Y-m-d",
                disable: blockedDates,
                minDate: "today",
                onClose: function(selectedDates){
                    if(selectedDates.length === 2){
                        $scope.startDate = selectedDates[0].toISOString();
                        $scope.endDate = selectedDates[1].toISOString();
                        $timeout();
                    }
                }
            });
        }
    };
    return factory;
});
