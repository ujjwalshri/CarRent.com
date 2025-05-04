angular.module('myApp').factory('BiddingFactory', function($timeout, CarService, $q, TaxService) {
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
        selectedAddons = [],
        platformFeePercentage = null,
        taxes = []
    ) {
        if (!(this instanceof Bid)) {
            return new Bid(
                _id, amount, startDate, endDate, from, vehicle, owner,
                startOdometerValue, endOdometerValue, status, selectedAddons,platformFeePercentage, taxes
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
        this.selectedAddons = selectedAddons;
        this.platformFeePercentage = platformFeePercentage || 0;
        this.taxes = taxes || [];
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

        if(this.selectedAddons.length > 10 ){
            return { error: "You can only select up to 10 addons." };
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

        const addonPrice = this.selectedAddons.reduce((acc, addon) => acc + addon.price, 0);
        return ((diffDays+1) * this.amount + addonPrice + ((diffDays+1) * this.amount + addonPrice) * this.platformFeePercentage / 100).toFixed(2);
    }
   
    /**
     * Generates and prints a PDF for the booking
     * @method generatePDF
     */
    Bid.prototype.generatePDF = function() {
        const self = this;
        
        // Calculate distance
        const totalDistance = self.endOdometerValue - self.startOdometerValue;
        
        // Extra distance fee if applicable
        const extraDistanceFee = totalDistance > 300 
            ? (totalDistance - 300) * 10  // ₹10 per km over 300
            : 0;
        
        // Base price from booking duration and daily rate
        const dailyRate = self.amount;
        const totalNumberOfDays = Math.ceil((new Date(self.endDate) - new Date(self.startDate)) / (1000 * 60 * 60 * 24)) + 1;
        
        // Calculate rental cost (daily rate * number of days)
        
        
        // Addons total calculation
        let addonsTotal = 0;
        if (self.selectedAddons && self.selectedAddons.length > 0) {
            addonsTotal = self.selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
        }
        const rentalCost = totalNumberOfDays * dailyRate + addonsTotal;
        
        // Format currency function for consistent Indian Rupees formatting
        const formatRupees = (value) => {
            return new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(value);
        };
        


            // Filter for active taxes
            const activeTaxes = this.taxes;
            
            // Base amount for tax calculation (booking amount * days)
            const baseAmountForTax = rentalCost - addonsTotal;
            
            // Apply taxes only if we have active taxes
            let totalTaxAmount = 0;
            const taxBreakdown = [];
            
            if (activeTaxes && activeTaxes.length > 0) {
                activeTaxes.forEach(tax => {
                    let taxAmount = 0;
                    
                    if (tax.type === 'percentage') {
                        // Apply percentage tax to the base amount
                        taxAmount = (baseAmountForTax * tax.value) / 100;
                    } else { // fixed
                        // Apply fixed tax
                        taxAmount = tax.value;
                    }
                    
                    taxAmount = Math.round(taxAmount * 100) / 100; // Round to 2 decimal places
                    totalTaxAmount += taxAmount;
                    
                    taxBreakdown.push({
                        name: tax.name,
                        value: tax.type === 'percentage' ? `${tax.value}%` : `₹${tax.value.toFixed(2)}`,
                        amount: taxAmount
                    });
                });
            }
            
            // Calculate platform fee
            const platformFee = (rentalCost * self.platformFeePercentage) / 100;
            
            // Calculate total amount including taxes
            const totalAmount = rentalCost + addonsTotal + platformFee + extraDistanceFee + totalTaxAmount;
            
            // Create PDF definition
            const docDefinition = {
                pageSize: 'A4',
                pageMargins: [40, 40, 40, 40],
                content: [
                    {
                        columns: [
                            { width: '*', text: 'CAR RENTAL INVOICE', style: 'header' },
                            { width: 'auto', text: new Date().toLocaleDateString(), style: 'date', alignment: 'right' }
                        ]
                    },
                    {
                        canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 1, lineColor: '#aaa' }]
                    },
                    { text: '\n' },
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
                                    { text: 'Invoice #: ' + self._id, style: 'invoiceNumber' },
                                    { text: 'Date: ' + new Date().toLocaleDateString(), style: 'invoiceDate' }
                                ]
                            }
                        ]
                    },
                    { text: '\n\n' },
                    // Booking Details
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
                                            { text: 'Owner Details', style: 'tableHeader' }
                                        ],
                                        [
                                            {
                                                stack: [
                                                    { text: `${self.vehicle.company} ${self.vehicle.name} ${self.vehicle.modelYear}`, style: 'tableContent' },
                                                    { text: 'Model Year: ' + self.vehicle.modelYear, style: 'tableContent' }
                                                ]
                                            },
                                            {
                                                stack: [
                                                    { text: self.owner.firstName + ' ' + self.owner.lastName, style: 'tableContent' },
                                                    { text: self.owner.username, style: 'tableContent' }
                                                ]
                                            }
                                        ]
                                    ]
                                }
                            }
                        ]
                    },
                    { text: '\n' },
                    // Rental Period
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
                                            { text: new Date(self.startDate).toLocaleString(), style: 'tableContent' },
                                            { text: new Date(self.endDate).toLocaleString(), style: 'tableContent' }
                                        ]
                                    ]
                                }
                            }
                        ]
                    },
                    { text: '\n' },
                    // Odometer Readings
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
                                            { text: self.startOdometerValue + ' km', style: 'tableContent' },
                                            { text: self.endOdometerValue + ' km', style: 'tableContent' }
                                        ]
                                    ]
                                }
                            }
                        ]
                    },
                    { text: '\n' },
                    // Add addons section if applicable
                    ...(self.selectedAddons && self.selectedAddons.length > 0 ? [{
                        stack: [
                            { text: 'Selected Addons', style: 'sectionHeader' },
                            {
                                table: {
                                    headerRows: 1,
                                    widths: ['*', 'auto'],
                                    body: [
                                        [
                                            { text: 'Addon Name', style: 'tableHeader' },
                                            { text: 'Price', style: 'tableHeader' }
                                        ],
                                        ...self.selectedAddons.map(addon => [
                                            { text: addon.name, style: 'tableContent' },
                                            { text: formatRupees(addon.price), style: 'tableContent' }
                                        ])
                                    ]
                                }
                            }
                        ]
                    }, { text: '\n' }] : []),
                    // Cost breakdown with tax details
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
                                            { text: formatRupees(dailyRate), style: 'tableContent' }
                                        ],
                                        [
                                            { text: `Rental Cost (${totalNumberOfDays} days)`, style: 'tableContent' },
                                            { text: formatRupees((rentalCost-addonsTotal)), style: 'tableContent' }
                                        ],
                                        ...(addonsTotal > 0 ? [[
                                            { text: 'Addons Total', style: 'tableContent' },
                                            { text: formatRupees(addonsTotal), style: 'tableContent' }
                                        ]] : []),
                                        // Tax details - only show if there are taxes
                                        ...taxBreakdown.map(tax => [
                                            { text: `${tax.name} (${tax.value})`, style: 'tableContent' },
                                            { text: formatRupees(tax.amount), style: 'tableContent' }
                                        ]),
                                        [
                                            { 
                                                text: 'Extra Distance Fee' + 
                                                    (extraDistanceFee > 0 ? ` (${totalDistance - 300} km over limit)` : ''),
                                                style: 'tableContent'
                                            },
                                            { text: formatRupees(extraDistanceFee), style: 'tableContent' }
                                        ],
                                        [
                                            { text: `Platform Fee (${self.platformFeePercentage}%)`, style: 'tableContent' },
                                            { text: formatRupees(platformFee), style: 'tableContent' }
                                        ],
                                        [
                                            { text: 'Total Amount', style: 'totalLabel' },
                                            { text: formatRupees(totalAmount - addonsTotal), style: 'totalAmount' }
                                        ]
                                    ]
                                }
                            }
                        ]
                    },
                    { text: '\n\n' },
                    {
                        stack: [
                            { text: 'Terms & Conditions', style: 'termsHeader' },
                            { text: '• Platform fee is non-refundable', style: 'termsContent' },
                            { text: '• Extra distance charges apply beyond 300km', style: 'termsContent' },
                            { text: '• All prices are in Indian Rupees (₹)', style: 'termsContent' },
                            { text: '• All applicable taxes are included in the total amount', style: 'termsContent' },
                            { text: '\n' },
                            { text: 'Thank you for choosing our service!', style: 'footer' }
                        ]
                    }
                ],
                styles: {
                    header: { fontSize: 24, bold: true, color: '#2c3e50', margin: [0, 0, 0, 10] },
                    date: { fontSize: 12, color: '#7f8c8d' },
                    companyName: { fontSize: 18, bold: true, color: '#2c3e50', margin: [0, 0, 0, 5] },
                    companyAddress: { fontSize: 10, color: '#7f8c8d', margin: [0, 0, 0, 2] },
                    invoiceNumber: { fontSize: 14, bold: true, color: '#2c3e50' },
                    invoiceDate: { fontSize: 12, color: '#7f8c8d' },
                    sectionHeader: { fontSize: 16, bold: true, color: '#2c3e50', margin: [0, 10, 0, 5] },
                    tableHeader: { fontSize: 12, bold: true, color: '#2c3e50', fillColor: '#f8f9fa' },
                    tableContent: { fontSize: 11, color: '#34495e' },
                    totalLabel: { fontSize: 14, bold: true, color: '#2c3e50' },
                    totalAmount: { fontSize: 14, bold: true, color: '#27ae60' },
                    footer: { fontSize: 12, color: '#7f8c8d', alignment: 'center', margin: [0, 20, 0, 0] },
                    subtotalLabel: { fontSize: 12, bold: true, color: '#34495e' },
                    subtotalAmount: { fontSize: 12, bold: true, color: '#34495e' },
                    termsHeader: { fontSize: 14, bold: true, color: '#2c3e50', margin: [0, 0, 0, 5] },
                    termsContent: { fontSize: 10, color: '#7f8c8d', margin: [0, 0, 0, 2] }
                }
            };
            
            // Generate and open PDF
            pdfMake.createPdf(docDefinition).open();
        
    }

    /**
     * Checks if the current date is between the booking start and end dates.
     * @returns {boolean} - Returns true if the current date is between the booking start and end dates, false otherwise.
     */
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
                data.selectedAddons,
                data.platformFeePercentage,
                data.taxes
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
        /**
         * Converts a response array to an array of Bid objects.
         * @param {Array} responseArray - The response array to convert.
         * @returns {Array} - Returns an array of Bid objects.
         */
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
        /**
         * Calculates the booking price.
         * @param {Date} startDate - The start date of the booking.
         * @param {Date} endDate - The end date of the booking.
         * @param {number} amount - The amount of the booking.
         * @returns {number} - Returns the booking price.
         */
        calculate : function(startDate, endDate, amount){
            startDate = new Date(startDate).setHours(0, 0, 0, 0);
            endDate = new Date(endDate).setHours(0, 0, 0, 0);
            var diffTime = endDate - startDate;
            var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            return (diffDays) * amount;
        },
        /**
         * Initializes the flatpickr date picker.
         * @param {Array} blockedDates - The dates to disable in the date picker.
         * @param {string} htmlElementId - The ID of the HTML element to initialize the date picker on.
         * @param {Object} $scope - The scope of the controller.
         */
        initializeFlatpickr: function(blockedDates, htmlElementId, $scope){
            $timeout(function() {
                if (window.flatpickr) {
                    window.flatpickr(htmlElementId, {
                        mode: "range",
                        minDate: "today",
                        dateFormat: "Y-m-d",
                        disable: blockedDates,
                        onChange: function(selectedDates) {
                            (function() {
                                if (selectedDates.length === 2) {
                                    $scope.startDate = selectedDates[0];
                                    $scope.endDate = selectedDates[1];
                                }
                            })();
                        }
                    });
                }
            });
        },
        validateTax : function(tax){
            if (!tax.name.trim()) {
                ToastService.error('Tax name is required');
                return false;
            }
            
            if (tax.type === 'percentage' && (tax.value < 0 || tax.value > 100)) {
                ToastService.error('Percentage value must be between 0 and 100');
                return false;
            }
            
            if (tax.type === 'fixed' && tax.value < 0) {
                ToastService.error('Fixed value cannot be negative');
                return false;
            }
            
            return true;
        }
    };
    return factory;
});
