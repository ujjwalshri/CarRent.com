angular.module('myApp').controller('sellerAnalyticsCtrl', function($scope, $q, ToastService, ChartService, $timeout) {
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
            ChartService.getTotalRevenue(params),
            ChartService.getCarDescription(params),
            ChartService.getPopularCars(params),
            ChartService.getTotalRevenueByAddons(params),
            ChartService.getAverageBidCostPerRental(params),
            ChartService.getAverageBookingPayment(params)
        ];

        // Performance Analytics
        const performancePromises = [
            ChartService.getCarWiseBookings(params),
            ChartService.getNegativeReviews(params),
            ChartService.getTopEarningCars(params),
            ChartService.getCityWiseNegativeReview(params)
        ];

        // Execute promises in parallel
        $q.all([
            $q.all(overviewPromises),
            $q.all(performancePromises)
        ])
        .then(([overviewData, performanceData]) => {
            const [revenue, carDescription, popularCars, totalRevenueByAddons, averageBidCostPerRental, averageBookingPayment] = overviewData;
            const [carWiseBookings, negativeReviews, topEarningCars, cityWiseNegativeReview] = performanceData;
            
            $scope.averageBidCostPerRental = averageBidCostPerRental.averageCostPerRental.averageCostPerRental[0]?.averageCostPerRental || 0;
            $scope.averageBookingPayment = averageBookingPayment.averageBookingPayment.averageBookingPayment[0]?.averageBookingPayment || 0;
            $scope.totalRevenueByAddons = totalRevenueByAddons.totalRevenueByAddons.totalRevenueByAddons.reduce((acc, curr) => acc + curr.totalAmount, 0);
            // Update scope variables
            // Handle case when revenue is null
            $scope.totalRevenue = 0;
            $scope.totalFineCollected = 0;
            $scope.numberOfBookings = 0;
            $scope.averageRevenue = 0;
            
            if (revenue && revenue.revenue) {
                $scope.totalRevenue = revenue.revenue.totalRevenue || 0;
                $scope.totalFineCollected = revenue.revenue.totalFineCollected || 0;
                $scope.numberOfBookings = revenue.revenue.totalBookings || 0;
                $scope.averageRevenue = revenue.revenue.averageRevenue || 0;
            }

            if (negativeReviews?.negativeReviews) {
                $scope.negativeReviewsCount = negativeReviews.negativeReviews.result.reduce((acc, curr) => acc + curr.count, 0);
            }

            // Create performance charts
            createPerformanceCharts({
                overview: {
                    carDescription,
                    popularCars
                },
                performance: {
                    carPerformance: carWiseBookings?.carPerformance,
                    negativeReviews: negativeReviews?.negativeReviews,
                    topEarningCars: topEarningCars?.topEarningCars,
                    cityWiseNegativeReview: cityWiseNegativeReview
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
            ChartService.getPeakHours(params),
            ChartService.getMonthlyBookings(params),
            ChartService.getTopCustomers(params),
            ChartService.getAverageRentalDuration(params),
            ChartService.getRepeatingCustomersPercentage(params),
            ChartService.getCityWiseBookings(params),
            ChartService.getSelectedAddonsCount(params),
            ChartService.getBiddingComparison(params),
            ChartService.getEarningComparison(params)
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
            if (averageRentalDuration?.averageRentalDuration) {
                $scope.averageRentalDuration = averageRentalDuration.averageRentalDuration.averageRentalDuration[0]?.averageRentalDuration || 0;
            }

            if (repeatingCustomers?.repeatingCustomersPercentage) {
                $scope.repeatingCustomersPercentage = repeatingCustomers.repeatingCustomersPercentage.repeatingCustomersPercentage[0]?.repeatingCustomerPercentage || 0;
            }
            // Create booking charts
            createBookingCharts({
                bookings: {
                    peakHours: peakHours?.peakHours,
                    monthlyBookings: monthlyBookings?.monthlyBookings,
                    topCustomers: topCustomers?.topCustomers,
                    cityWiseBookings: cityWiseBookings?.cityWiseBookings,
                    selectedAddonsCount: selectedAddonsCount?.selectedAddonsCount
                },
                comparisons: {
                    biddingComparison: biddingComparison?.biddingComparison,
                    earningComparison: earningComparison?.earningComparison
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
        if (overview.carDescription?.carDescription?.suvVsSedan) {
            console.log(overview.carDescription.carDescription.suvVsSedan);
            createChartIfCanvasExists("carCategoriesChart", () => 
                ChartService.createBarChart(
                    "bar",
                    overview.carDescription.carDescription.suvVsSedan.map(item => item._id),
                    overview.carDescription.carDescription.suvVsSedan.map(item => item.count),
                    'Number of Cars',
                    "Car Categories Distribution",
                    "carCategoriesChart"
                )
            );
        }

        if (overview.popularCars?.popularCars?.top3MostPopularCars) {
            createChartIfCanvasExists("myMostPopularCar", () =>
                ChartService.createBarChart(
                    "bar",
                    overview.popularCars.popularCars.top3MostPopularCars.map(car => car._id),
                    overview.popularCars.popularCars.top3MostPopularCars.map(car => car.count),
                    'Number of Biddings',
                    "Most Popular Cars",
                    "myMostPopularCar"
                )
            );
        }

        // Performance Charts
        if (performance.negativeReviews?.result) {
            createChartIfCanvasExists("carWiseNegativeReviews", () =>
                ChartService.createBarChart(
                    "bar",
                    performance.negativeReviews.result.map(car => car._id),
                    performance.negativeReviews.result.map(car => car.count),
                    'Number of Negative Reviews',
                    "Car-wise Negative Reviews",
                    "carWiseNegativeReviews"
                )
            );
        }

        if (performance.topEarningCars?.top3CarsWithMostEarning) {
            createChartIfCanvasExists("top3CarsWithMostEarning", () =>
                ChartService.createBarChart(
                    "bar",
                    performance.topEarningCars.top3CarsWithMostEarning.map(car => car._id),
                    performance.topEarningCars.top3CarsWithMostEarning.map(car => car.totalRevenue),
                    'Total Revenue ($)',
                    "Top 3 Earning Cars",
                    "top3CarsWithMostEarning"
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

        if (bookings.peakHours?.peakBiddingHours) {
            createChartIfCanvasExists("hourlyBiddingHeatmap", () =>
                ChartService.createLineChart("hourlyBiddingHeatmap", {
                    labels: bookings.peakHours.peakBiddingHours.map(hour => formatHour(hour.hour)),
                    data: bookings.peakHours.peakBiddingHours.map(hour => hour.count),
                    title: "Peak Bidding Hours",
                    label: "Number of Biddings"
                })
            );
        }

        if (bookings.monthlyBookings?.monthWiseBookings) {
            createChartIfCanvasExists("numberOfBookingsPerMonth", () =>
                ChartService.createBarChart(
                    "bar",
                    bookings.monthlyBookings.monthWiseBookings.map(booking => booking._id),
                    bookings.monthlyBookings.monthWiseBookings.map(booking => booking.count),
                    'Number of Bookings',
                    "Monthly Booking Trends",
                    "numberOfBookingsPerMonth"
                )
            );
        }

        if (bookings.topCustomers?.top3CostumersWithMostBookings) {
            createChartIfCanvasExists("top3CostumersWithMostBookings", () =>
                ChartService.createBarChart(
                    "bar",
                    bookings.topCustomers.top3CostumersWithMostBookings.map(customer => customer._id),
                    bookings.topCustomers.top3CostumersWithMostBookings.map(customer => customer.count),
                    'Number of Bookings',
                    "Top 3 Customers",
                    "top3CostumersWithMostBookings"
                )
            );
        }

        if (bookings.cityWiseBookings?.cityWiseBookings) {
            createChartIfCanvasExists("cityWiseBooking", () =>
                ChartService.createBarChart(
                    "bar",
                    bookings.cityWiseBookings.cityWiseBookings.map(city => city._id),
                    bookings.cityWiseBookings.cityWiseBookings.map(city => city.count),
                    'Number of Bookings',
                    "City-wise Bookings",
                    "cityWiseBooking"
                )
            );
        }

        if (bookings.selectedAddonsCount?.selectedAddonsCount) {
            createChartIfCanvasExists("selectedAddonsCount", () =>
                ChartService.createBarChart(
                    "bar",
                    bookings.selectedAddonsCount.selectedAddonsCount.map(addon => addon._id),
                    bookings.selectedAddonsCount.selectedAddonsCount.map(addon => addon.count),
                    'Number of Bookings',
                    "Selected Addons Count",
                    "selectedAddonsCount"
                )
            );
        }

        if (comparisons.biddingComparison?.biddingComparison) {
            createChartIfCanvasExists("myBidsVsOtherSellersAvgBids", () =>
                ChartService.createBarChart(
                    "line",
                    ["My Bids", "Average Seller Bids"],
                    [
                        comparisons.biddingComparison.biddingComparison.myBids,
                        comparisons.biddingComparison.biddingComparison.otherSellersAvgBids
                    ],
                    'Number of Bids',
                    "Bidding Comparison",
                    "myBidsVsOtherSellersAvgBids"
                )
            );
        }

        if (comparisons.earningComparison?.earningComparison) {
            createChartIfCanvasExists("myEarningVsOtherSellersAvgEarnings", () =>
                ChartService.createBarChart(
                    "line",
                    ["My Earnings", "Average Seller Earnings"],
                    [
                        comparisons.earningComparison.earningComparison.myEarnings,
                        comparisons.earningComparison.earningComparison.otherSellersAvgEarnings
                    ],
                    'Earnings ($)',
                    "Earning Comparison",
                    "myEarningVsOtherSellersAvgEarnings"
                )
            );
        }
    };

});