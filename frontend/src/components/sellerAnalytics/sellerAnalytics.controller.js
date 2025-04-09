angular.module('myApp').controller('sellerAnalyticsCtrl', function($scope, $q, ToastService, ChartService) {
    // Initialize date-related variables
    const initializeDates = () => {
        $scope.startDate = new Date();
        $scope.startDate.setDate($scope.startDate.getDate() - 7);
        $scope.endDate = new Date();
    };

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
     * Creates all charts using ChartService
     */
    const createCharts = (data) => {
        const { overview, performance, bookings, comparisons } = data;

        // Overview Charts
        if (overview.carDescription?.suvVsSedan) {
            ChartService.createBarChart(
                "bar",
                overview.carDescription.suvVsSedan.map(item => item._id),
                overview.carDescription.suvVsSedan.map(item => item.count),
                'Number of Cars',
                "Car Categories Distribution",
                "carCategoriesChart"
            );
        }

        if (overview.popularCars?.top3MostPopularCars) {
            ChartService.createBarChart(
                "bar",
                overview.popularCars.top3MostPopularCars.map(car => car._id),
                overview.popularCars.top3MostPopularCars.map(car => car.count),
                'Number of Bookings',
                "Most Popular Cars",
                "myMostPopularCar"
            );
        }

        // Performance Charts
        if (performance.carPerformance?.carWiseBookings) {
            ChartService.createBarChart(
                "bar",
                performance.carPerformance.carWiseBookings.map(car => car._id),
                performance.carPerformance.carWiseBookings.map(car => car.count),
                'Number of Bookings',
                "Car-wise Booking Performance",
                "carAndBookingsChart"
            );
        }

        if (performance.negativeReviews?.result) {
            ChartService.createBarChart(
                "bar",
                performance.negativeReviews.result.map(car => car._id),
                performance.negativeReviews.result.map(car => car.count),
                'Number of Negative Reviews',
                "Car-wise Negative Reviews",
                "carWiseNegativeReviews"
            );
        }

        if (performance.topEarningCars?.top3CarsWithMostEarning) {
            ChartService.createBarChart(
                "bar",
                performance.topEarningCars.top3CarsWithMostEarning.map(car => car._id),
                performance.topEarningCars.top3CarsWithMostEarning.map(car => car.totalRevenue),
                'Total Revenue ($)',
                "Top 3 Earning Cars",
                "top3CarsWithMostEarning"
            );
        }

        // Booking Charts
        if (bookings.peakHours?.peakBiddingHours) {
            ChartService.createLineChart("hourlyBiddingHeatmap", {
                labels: bookings.peakHours.peakBiddingHours.map(hour => formatHour(hour.hour)),
                data: bookings.peakHours.peakBiddingHours.map(hour => hour.count),
                title: "Peak Booking Hours",
                label: "Number of Bookings"
            });
        }

        if (bookings.monthlyBookings?.monthWiseBookings) {
            ChartService.createBarChart(
                "bar",
                bookings.monthlyBookings.monthWiseBookings.map(booking => booking._id),
                bookings.monthlyBookings.monthWiseBookings.map(booking => booking.count),
                'Number of Bookings',
                "Monthly Booking Trends",
                "numberOfBookingsPerMonth"
            );
        }

        if (bookings.topCustomers?.top3CostumersWithMostBookings) {
            ChartService.createBarChart(
                "bar",
                bookings.topCustomers.top3CostumersWithMostBookings.map(customer => customer._id),
                bookings.topCustomers.top3CostumersWithMostBookings.map(customer => customer.count),
                'Number of Bookings',
                "Top 3 Customers",
                "top3CostumersWithMostBookings"
            );
        }

        if (bookings.cityWiseBookings?.cityWiseBookings) {
            ChartService.createBarChart(
                "bar",
                bookings.cityWiseBookings.cityWiseBookings.map(city => city._id),
                bookings.cityWiseBookings.cityWiseBookings.map(city => city.count),
                'Number of Bookings',
                "City-wise Bookings",
                "cityWiseBooking"
            );
        }
         
        // Comparison Charts
        if (comparisons.biddingComparison) {
            console.log(comparisons.biddingComparison);
            const { myBids, otherSellersAvgBids } = comparisons.biddingComparison;
            console.log(myBids, otherSellersAvgBids);
            ChartService.createBarChart(
                "bar",
                ["My Bids", "Average Seller Bids"],
                [myBids, otherSellersAvgBids],
                'Number of Bids',
                "Bidding Comparison",
                "myBidsVsOtherSellersAvgBids"
            );
        }

        if (comparisons.earningComparison) {
            const { myEarnings, otherSellersAvgEarnings } = comparisons.earningComparison;
            ChartService.createBarChart(
                "bar",
                ["My Earnings", "Average Seller Earnings"],
                [myEarnings, otherSellersAvgEarnings],
                'Earnings ($)',
                "Earning Comparison",
                "myEarningVsOtherSellersAvgEarnings"
            );
        }
    };

    /**
     * Fetches analytics data from the server using individual API endpoints
     */
    const fetchAnalyticsData = () => {
        if (!validateDateRange()) return;

        const params = {
            startDate: $scope.startDate.toISOString(),
            endDate: $scope.endDate.toISOString()
        };

        // Overview Analytics
        const overviewPromises = [
            ChartService.getTotalRevenue(params),
            ChartService.getCarDescription(params),
            ChartService.getPopularCars(params)
        ];

        // Performance Analytics
        const performancePromises = [
            ChartService.getCarWiseBookings(params),
            ChartService.getNegativeReviews(params),
            ChartService.getTopEarningCars(params)
        ];

        // Booking Analytics
        const bookingPromises = [
            ChartService.getPeakHours(params),
            ChartService.getMonthlyBookings(params),
            ChartService.getTopCustomers(params),
            ChartService.getAverageRentalDuration(params),
            ChartService.getRepeatingCustomersPercentage(params),
            ChartService.getCityWiseBookings(params)
        ];

        // Comparison Analytics
        const comparisonPromises = [
            ChartService.getBiddingComparison(params),
            ChartService.getEarningComparison(params)
        ];

        // Execute all promises in parallel for better performance
        Promise.all([
            Promise.all(overviewPromises),
            Promise.all(performancePromises),
            Promise.all(bookingPromises),
            Promise.all(comparisonPromises)
        ])
        .then(([overviewData, performanceData, bookingData, comparisonData]) => {
            // Process Overview Data
            const [revenue, carDescription, popularCars] = overviewData;
            
            // Process Performance Data
            const [carWiseBookings, negativeReviews, topEarningCars] = performanceData;
            
            // Process Booking Data
            const [peakHours, monthlyBookings, topCustomers, averageRentalDuration, repeatingCustomers, cityWiseBookings] = bookingData;

            // Process Comparison Data
            const [biddingComparison, earningComparison] = comparisonData;

            // Update scope variables
            if (revenue?.revenue) {
                $scope.totalRevenue = revenue.revenue.totalRevenue || 0;
                $scope.totalFineCollected = revenue.revenue.totalFineCollected || 0;
                $scope.numberOfBookings = revenue.revenue.totalBookings || 0;
                $scope.averageRevenue = revenue.revenue.averageRevenue || 0;
            }
            console.log(overviewData);
            console.log(performanceData);
            console.log(bookingData);
            console.log(comparisonData);


            if (negativeReviews?.negativeReviews) {
                $scope.negativeReviewsCount = negativeReviews.negativeReviews.result.reduce((acc, curr) => acc + curr.count, 0);
            }

            if (averageRentalDuration?.averageRentalDuration) {
                $scope.averageRentalDuration = averageRentalDuration.averageRentalDuration.averageRentalDuration[0]?.averageRentalDuration || 0;
            }

            if (repeatingCustomers?.repeatingCustomersPercentage) {
                $scope.repeatingCustomersPercentage = repeatingCustomers.repeatingCustomersPercentage.repeatingCustomersPercentage[0]?.repeatingCustomerPercentage || 0;
            }

            // Create charts with the updated data
            createCharts({
                overview: {
                    revenue: revenue?.revenue,
                    carDescription,
                    popularCars
                },
                performance: {
                    carPerformance: carWiseBookings?.carPerformance,
                    negativeReviews: negativeReviews?.negativeReviews,
                    topEarningCars: topEarningCars?.topEarningCars
                },
                bookings: {
                    peakHours: peakHours?.peakHours,
                    monthlyBookings: monthlyBookings?.monthlyBookings,
                    topCustomers: topCustomers?.topCustomers,
                    averageRentalDuration: averageRentalDuration?.averageRentalDuration,
                    repeatingCustomersPercentage: repeatingCustomers?.repeatingCustomersPercentage,
                    cityWiseBookings: cityWiseBookings?.cityWiseBookings
                },
                comparisons: {
                    biddingComparison: biddingComparison?.biddingComparison,
                    earningComparison: earningComparison?.earningComparison
                }
            });

            // Apply digest cycle since we're updating scope variables
            if (!$scope.$$phase) {
                $scope.$apply();
            }
        })
        .catch(error => {
            console.error('Error fetching analytics data:', error);
            ToastService.error('Failed to fetch analytics data');
        });
    };

    // Controller public methods
    $scope.init = () => {
        initializeDates();
        initializeAnalyticsData();
        fetchAnalyticsData();
    };

    $scope.getAnalytics = () => {
        fetchAnalyticsData();
    };

    $scope.resetDateFilter = () => {
        initializeDates();
        fetchAnalyticsData();
    };
});