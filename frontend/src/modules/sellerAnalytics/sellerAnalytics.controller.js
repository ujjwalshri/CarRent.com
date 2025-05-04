angular.module('myApp').controller('sellerAnalyticsCtrl', function($scope, $q, ToastService, ChartService, SellerAnalyticsService, $timeout) {
    let chartInstances = {};
    const initializeDates = () => {
        $scope.startDate = new Date();
        $scope.startDate.setDate($scope.startDate.getDate() - 7);
        $scope.endDate = new Date();
    };
    $scope.isLoading = false;
    $scope.isPerformanceLoading = false;
    $scope.isBookingLoading = false;
    $scope.performanceLoaded = false;
    $scope.bookingLoaded = false;
    const initializeAnalyticsData = () => {
        $scope.totalRevenue = 0;
        $scope.averageRentalDuration = 0;
        $scope.totalFineCollected = 0;
        $scope.numberOfBookings = 0;
        $scope.negativeReviewsCount = 0;
        $scope.repeatingCustomersPercentage = 0;
        $scope.averageRevenue = 0;
        $scope.totalRevenueByAddons = 0;
    };

    /**
     * Initializes the controller
     * @returns {void}
     * @description Initializes the controller and sets the current tab to performance
     * @param {string} tab - The tab to set the current tab to 
     * @example $scope.init();
     */
    $scope.init = () => {
        initializeDates();
        initializeAnalyticsData();
        $scope.currentTab = 'performance'; 
    };

   /**
    * Resets the date filter
    * @returns {void}
    * @description Resets the date filter and gets the analytics
    * @example $scope.resetDateFilter();
    */
    $scope.resetDateFilter = () => {
        initializeDates();
        $scope.getAnalytics(); 
    };

   /**
    * Gets the analytics
    * @returns {void}
    * @description Gets the analytics and destroys all charts
    * @example $scope.getAnalytics();
    */
    $scope.getAnalytics = () => {
        destroyAllCharts();
        $scope.performanceLoaded = false;
        $scope.bookingLoaded = false;
        
        // Load data based on current tab
        if ($scope.currentTab === 'performance') {
            $scope.loadPerformanceAnalytics();
        } else {
            $scope.loadBookingAnalytics();
        }
    };

   /**
    * Handles the tab selection
    * @returns {void}
    * @description Handles the tab selection and destroys all charts
    * @example $scope.onTabSelect('performance');
    */
    $scope.onTabSelect = (tab) => {
        $scope.currentTab = tab;
        destroyAllCharts();
        
        if (tab === 'performance') {
            $scope.loadPerformanceAnalytics();
        } else {
            $scope.loadBookingAnalytics();
        }
    };

   /**
    * Destroys all existing charts
    * @returns {void}
    * @description Destroys all existing charts
    * @example destroyAllCharts();
    */
    const destroyAllCharts = () => {
        Object.values(chartInstances).forEach(chart => {
            if (chart) {
                chart.destroy();
            }
        });
        chartInstances = {};
    };

   /**
    * Cleans up on tab change
    * @returns {void}
    * @description Cleans up on tab change
    * @example $scope.$on('$destroy', () => {
        destroyAllCharts();
    });
    */
    $scope.$on('$destroy', () => {
        destroyAllCharts();
    });

    /**
     * Creates a chart if the canvas exists
     * @returns {void}
     * @description Creates a chart if the canvas exists
     * @example createChartIfCanvasExists('canvasId', () => {
        return ChartService.createBarChart(canvas);
    });
    */
    const createChartIfCanvasExists = (canvasId, createFn) => {
        $timeout(() => {
            const canvas = document.getElementById(canvasId);
            if (canvas) {
                // Destroy existing chart if it exists
                if (chartInstances[canvasId]) {
                    chartInstances[canvasId].destroy();
                }
                // Create new chart
                chartInstances[canvasId] = createFn(canvas);
            }
        }); 
    };

    /**
     * Validates date range for analytics
     * @returns {boolean} Whether dates are valid
     */
    const validateDateRange = () => {
        if (!$scope.startDate || !$scope.endDate) {
            ToastService.error("Please select both start and end dates.");
            return false;
        }

        if ($scope.startDate > $scope.endDate) {
            ToastService.error("Start date must be earlier than end date.");
            return false;
        }

        if ($scope.endDate.setHours(0,0,0,0) > new Date().setHours(0, 0, 0, 0)) {
            ToastService.error("End date must be earlier or equal to today.");
            return false;
        }

        // Set time to midnight for start date and end of day for end date
        $scope.startDate.setHours(0, 0, 0, 0);
        $scope.endDate.setHours(23, 59, 59, 999);
        return true;
    };

    /**
     * Formats hour for display in charts
     * @param {number} hour - The hour to format
     * @returns {string} - The formatted hour
     */
    const formatHour = (hour) => {
        const suffix = hour >= 12 ? "PM" : "AM";
        return hour === 0 ? "12 AM" : 
               hour === 12 ? "12 PM" : 
               `${hour % 12} ${suffix}`;
    };

    /**
     * Load performance analytics data
     * @returns {Promise} - Returns the performance analytics data
     */
    $scope.loadPerformanceAnalytics = () => {
        if (!validateDateRange()) return;
        $scope.isLoading = true;

        $scope.isPerformanceLoading = true;

        const params = {
            startDate: $scope.startDate.toISOString(),
            endDate: $scope.endDate.toISOString()
        };

        // Overview Analytics
        const overviewPromises = [
            SellerAnalyticsService.getTotalRevenue(params),
            SellerAnalyticsService.getCarDescription(params),
            SellerAnalyticsService.getPopularCars(params),
            SellerAnalyticsService.getTotalRevenueByAddons(params),
            SellerAnalyticsService.getAverageBidCostPerRental(params),
            SellerAnalyticsService.getAverageBookingPayment(params)
        ];

        // Performance Analytics
        const performancePromises = [
            SellerAnalyticsService.getCarWiseBookings(params),
            SellerAnalyticsService.getNegativeReviews(params),
            SellerAnalyticsService.getTopEarningCars(params),
            SellerAnalyticsService.getCityWiseNegativeReview(params)
        ];

        // Execute promises in parallel
        $q.all([
            $q.all(overviewPromises),
            $q.all(performancePromises)
        ])
        .then(([overviewData, performanceData]) => {
            const [revenue, carDescription, popularCars, totalRevenueByAddons, averageBidCostPerRentalData, averageBookingPayment] = overviewData;
            const [carWiseBookings, negativeReviews, topEarningCars, cityWiseNegativeReview] = performanceData;

            $scope.averageBidCostPerRental = averageBidCostPerRentalData[0]?.averageCostPerRental || 0;
            $scope.averageBookingPayment = averageBookingPayment[0]?.averageBookingPayment || 0;
            $scope.totalRevenueByAddons = totalRevenueByAddons ? 
                totalRevenueByAddons.reduce((acc, curr) => acc + curr.totalAmount, 0) : 0;
                
            // Update scope variables with flattened data
            $scope.totalRevenue = revenue?.totalRevenue || 0;
            $scope.totalFineCollected = revenue?.totalFineCollected || 0;
            $scope.numberOfBookings = revenue?.totalBookings || 0;
            $scope.averageRevenue = revenue?.averageRevenue || 0;

            if (negativeReviews) {
                $scope.negativeReviewsCount = negativeReviews.reduce((acc, curr) => acc + curr.count, 0);
            }

            // Create performance charts
            createPerformanceCharts({
                overview: {
                    carDescription,
                    popularCars
                },
                performance: {
                    carPerformance: carWiseBookings,
                    negativeReviews,
                    topEarningCars,
                    cityWiseNegativeReview
                }
            });

            $scope.performanceLoaded = true;
        })
        .catch(error => {
            console.error('Error loading performance analytics:', error);
            ToastService.error('Failed to load performance analytics');
        })
        .finally(() => {
            $scope.isPerformanceLoading = false;
            $scope.isLoading = false;
            $timeout();
        });
    };

   /**
    * Load booking analytics data
    * @returns {Promise} - Returns the booking analytics data
    */
    $scope.loadBookingAnalytics = () => {
        if (!validateDateRange()) return;

        $scope.isLoading = true;

        $scope.isBookingLoading = true;

        const params = {
            startDate: $scope.startDate.toISOString(),
            endDate: $scope.endDate.toISOString()
        };

        // Booking Analytics
        const bookingPromises = [
            SellerAnalyticsService.getPeakHours(params),
            SellerAnalyticsService.getMonthlyBookings(params),
            SellerAnalyticsService.getTopCustomers(params),
            SellerAnalyticsService.getAverageRentalDuration(params),
            SellerAnalyticsService.getRepeatingCustomersPercentage(params),
            SellerAnalyticsService.getCityWiseBookings(params),
            SellerAnalyticsService.getSelectedAddonsCount(params),
            SellerAnalyticsService.getBiddingComparison(params),
            SellerAnalyticsService.getEarningComparison(params)
        ];

        $q.all(bookingPromises)
        .then(([
            peakHours,
            monthlyBookings,
            topCustomers,
            averageRentalDuration,
            repeatingCustomers,
            cityWiseBookings,
            selectedAddonsCount,
            biddingComparison,
            earningComparison
        ]) => {
            if (averageRentalDuration && averageRentalDuration.length > 0) {
                $scope.averageRentalDuration = averageRentalDuration[0]?.averageRentalDuration || 0;
            }

            if (repeatingCustomers && repeatingCustomers.length > 0) {
                $scope.repeatingCustomersPercentage = repeatingCustomers[0]?.repeatingCustomerPercentage || 0;
            }
            // Create booking charts
            createBookingCharts({
                bookings: {
                    peakHours: peakHours,
                    monthlyBookings: monthlyBookings,
                    topCustomers: topCustomers,
                    cityWiseBookings: cityWiseBookings,
                    selectedAddonsCount: selectedAddonsCount
                },
                comparisons: {
                    biddingComparison: biddingComparison,
                    earningComparison: earningComparison
                }
            });

            $scope.bookingLoaded = true;
        })
        .catch(error => {
            console.error('Error loading booking analytics:', error);
            ToastService.error('Failed to load booking analytics');
        })
        .finally(() => {
            $scope.isBookingLoading = false;
            $scope.isLoading = false;
            $timeout();
        });
    };

    /**
     * Creates performance charts
     */
    const createPerformanceCharts = (data) => {
        const { overview, performance } = data;

        // Overview Charts
        if (overview.carDescription) {
           
            
            // Add pie chart for car categories
            createChartIfCanvasExists("carCategoriesPieChart", () => 
                ChartService.createPieChart(
                    overview.carDescription.map(item => item._id),
                    overview.carDescription.map(item => item.count),
                    "Car Categories",
                    "carCategoriesPieChart"
                )
            );
        }

        if (overview.popularCars) {
            createChartIfCanvasExists("myMostPopularCar", () =>
                ChartService.createBarChart(
                    "bar",
                    overview.popularCars.map(car => car._id),
                    overview.popularCars.map(car => car.count),
                    'Number of Biddings',
                    "Most Popular Cars",
                    "myMostPopularCar"
                )
            );
        }

        // Performance Charts
        if (performance.negativeReviews) {
            createChartIfCanvasExists("carWiseNegativeReviews", () =>
                ChartService.createBarChart(
                    "bar",
                    performance.negativeReviews.map(car => car._id),
                    performance.negativeReviews.map(car => car.count),
                    'Number of Negative Reviews',
                    "Car-wise Negative Reviews",
                    "carWiseNegativeReviews"
                )
            );
        }

        if (performance.topEarningCars) {
            const rupeesFormat = (value) => {
                return '₹' + value.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
            };

            createChartIfCanvasExists("top3CarsWithMostEarning", () =>
                ChartService.createBarChart(
                    "bar",
                    performance.topEarningCars.map(car => car._id),
                    performance.topEarningCars.map(car => car.totalRevenue),
                    'Total Revenue (₹)',
                    "Top 3 Earning Cars",
                    "top3CarsWithMostEarning"
                )
            );
            
            // Add pie chart for revenue distribution
            createChartIfCanvasExists("revenuePieChart", () =>
                ChartService.createPieChart(
                    performance.topEarningCars.map(car => car._id),
                    performance.topEarningCars.map(car => car.totalRevenue),
                    "Revenue Distribution",
                    "revenuePieChart"
                )
            );
        }
        
        if (performance.cityWiseNegativeReview) {
            createChartIfCanvasExists("cityWiseNegativeReviews", () =>
                ChartService.createMultilineChart(
                    performance.cityWiseNegativeReview,
                    "cityWiseNegativeReviews"
                )
            );
        }
    };

    /**
     * Creates booking charts
     */
    const createBookingCharts = (data) => {
        const { bookings, comparisons } = data;

        if (bookings.peakHours?.data) {
            createChartIfCanvasExists("hourlyBiddingHeatmap", () =>
                ChartService.createLineChart("hourlyBiddingHeatmap", {
                    labels: bookings.peakHours.data.map(hour => formatHour(hour.hour)),
                    data: bookings.peakHours.data.map(hour => hour.count),
                    title: "Peak Bidding Hours",
                    label: "Number of Biddings"
                })
            );
        }

        if (bookings.monthlyBookings) {
            createChartIfCanvasExists("numberOfBookingsPerMonth", () =>
                ChartService.createBarChart(
                    "bar",
                    bookings.monthlyBookings.map(booking => booking._id),
                    bookings.monthlyBookings.map(booking => booking.count),
                    'Number of Bookings',
                    "Monthly Booking Trends",
                    "numberOfBookingsPerMonth"
                )
            );
        }

        if (bookings.topCustomers) {
            createChartIfCanvasExists("top3CostumersWithMostBookings", () =>
                ChartService.createBarChart(
                    "bar",
                    bookings.topCustomers.map(customer => customer._id),
                    bookings.topCustomers.map(customer => customer.count),
                    'Number of Bookings',
                    "Top 3 Customers",
                    "top3CostumersWithMostBookings"
                )
            );
        }

        if (bookings.cityWiseBookings) {
            createChartIfCanvasExists("cityWiseBooking", () =>
                ChartService.createBarChart(
                    "bar",
                    bookings.cityWiseBookings.map(city => city._id),
                    bookings.cityWiseBookings.map(city => city.count),
                    'Number of Bookings',
                    "City-wise Bookings",
                    "cityWiseBooking"
                )
            );
            
            
        }

        if (bookings.selectedAddonsCount) {
            createChartIfCanvasExists("selectedAddonsCount", () =>
                ChartService.createBarChart(
                    "bar",
                    bookings.selectedAddonsCount.map(addon => addon._id),
                    bookings.selectedAddonsCount.map(addon => addon.count),
                    'Number of Bookings',
                    "Selected Addons Count",
                    "selectedAddonsCount"
                )
            );
            
            // Add pie chart for addons distribution
            createChartIfCanvasExists("addonsPieChart", () =>
                ChartService.createPieChart(
                    bookings.selectedAddonsCount.map(addon => addon._id),
                    bookings.selectedAddonsCount.map(addon => addon.count),
                    "Addons Distribution",
                    "addonsPieChart"
                )
            );
        }

        if (comparisons.biddingComparison) {
            createChartIfCanvasExists("myBidsVsOtherSellersAvgBids", () =>
                ChartService.createBarChart(
                    "line",
                    ["My Bids", "Average Seller Bids"],
                    [
                        comparisons.biddingComparison.myBids,
                        comparisons.biddingComparison.otherSellersAvgBids
                    ],
                    'Number of Bids',
                    "Bidding Comparison",
                    "myBidsVsOtherSellersAvgBids"
                )
            );
        }

        if (comparisons.earningComparison) {
            createChartIfCanvasExists("myEarningVsOtherSellersAvgEarnings", () =>
                ChartService.createBarChart(
                    "line",
                    ["My Earnings", "Average Seller Earnings"],
                    [
                        comparisons.earningComparison.myEarnings,
                        comparisons.earningComparison.otherSellersAvgEarnings
                    ],
                    'Earnings (₹)',
                    "Earning Comparison",
                    "myEarningVsOtherSellersAvgEarnings"
                )
            );
        }
    };

});