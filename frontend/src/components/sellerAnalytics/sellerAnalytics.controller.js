angular.module('myApp').controller('sellerAnalyticsCtrl', function($scope, $q, ToastService, ChartService, $timeout) {
    // Initialize chart instances
    let chartInstances = {};

    // Initialize date-related variables
    const initializeDates = () => {
        $scope.startDate = new Date();
        $scope.startDate.setDate($scope.startDate.getDate() - 7);
        $scope.endDate = new Date();
    };

    // Initialize loading states
    $scope.isLoading = false;
    $scope.isPerformanceLoading = false;
    $scope.isBookingLoading = false;
    $scope.performanceLoaded = false;
    $scope.bookingLoaded = false;

    // Initialize analytics data variables
    const initializeAnalyticsData = () => {
        $scope.totalRevenue = 0;
        $scope.averageRentalDuration = 0;
        $scope.totalFineCollected = 0;
        $scope.numberOfBookings = 0;
        $scope.negativeReviewsCount = 0;
        $scope.repeatingCustomersPercentage = 0;
        $scope.averageRevenue = 0;
    };

    // Initialize the controller
    $scope.init = () => {
        initializeDates();
        initializeAnalyticsData();
        $scope.currentTab = 'performance'; // Track current tab
    };

    // Reset date filter
    $scope.resetDateFilter = () => {
        initializeDates();
        $scope.getAnalytics();
    };

    // Get analytics based on date filter
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

    // Handle tab selection
    $scope.onTabSelect = (tab) => {
        $scope.currentTab = tab;
        destroyAllCharts();
        
        if (tab === 'performance') {
            $scope.loadPerformanceAnalytics();
        } else {
            $scope.loadBookingAnalytics();
        }
    };

    // Destroy all existing charts
    const destroyAllCharts = () => {
        Object.values(chartInstances).forEach(chart => {
            if (chart) {
                chart.destroy();
            }
        });
        chartInstances = {};
    };

    // Clean up on tab change
    $scope.$on('$destroy', () => {
        destroyAllCharts();
    });

    // Create chart if canvas exists
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
        }, 100); // Small delay to ensure DOM is ready
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
     */
    const formatHour = (hour) => {
        const suffix = hour >= 12 ? "PM" : "AM";
        return hour === 0 ? "12 AM" : 
               hour === 12 ? "12 PM" : 
               `${hour % 12} ${suffix}`;
    };

    /**
     * Load performance analytics data
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
            ChartService.getTopEarningCars(params)
        ];

        // Execute promises in parallel
        Promise.all([
            Promise.all(overviewPromises),
            Promise.all(performancePromises)
        ])
        .then(([overviewData, performanceData]) => {
            // Process Overview Data
            const [revenue, carDescription, popularCars, totalRevenueByAddons, averageBidCostPerRental, averageBookingPayment] = overviewData;

            $scope.averageBidCostPerRental = averageBidCostPerRental.averageCostPerRental.averageCostPerRental[0]?.averageCostPerRental || 0;
            $scope.averageBookingPayment = averageBookingPayment.averageBookingPayment.averageBookingPayment[0]?.averageBookingPayment || 0;

            let arr = totalRevenueByAddons.totalRevenueByAddons.totalRevenueByAddons;
            let sum = 0;
            for(let i = 0; i < arr.length; i++){
                sum += arr[i].totalAmount;
            }
            $scope.totalRevenueByAddons = sum;
         
            // Process Performance Data
            const [carWiseBookings, negativeReviews, topEarningCars] = performanceData;

            // Update scope variables
            if (revenue?.revenue) {
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
                    topEarningCars: topEarningCars?.topEarningCars
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

        Promise.all(bookingPromises)
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
                    'Number of Bookings',
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