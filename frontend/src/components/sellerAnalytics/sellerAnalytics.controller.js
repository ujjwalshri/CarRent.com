angular.module('myApp').controller('sellerAnalyticsCtrl', function($scope, $q, ToastService, ChartService) {
    // Initialize date-related variables
    const initializeDates = () => {
        $scope.startDate = new Date();
        $scope.startDate.setDate($scope.startDate.getDate() - 7);
        $scope.endDate = new Date();
        $scope.months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
    };

    // Initialize analytics data variables
    const initializeAnalyticsData = () => {
        $scope.totalRevenue = 0;
        $scope.averageRentalDuration = 0;
        $scope.totalFineCollected = 0;
        $scope.numberOfBookings = 0;
        $scope.dateFiltered = false;
        $scope.dateFilteredRevenue = 0;
        $scope.percentageOfTotalRevenue = 100;
        $scope.negativeReviewsCount = 0;
        $scope.percentageOfTotalFineCollected = 100;
        $scope.repeatingCustomersPercentage = 0;
        $scope.showDateFilter = true;
        $scope.timePeriod = 'last7days';
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
     * Creates all charts using ChartService
     */
    const createCharts = (data) => {
        const { overview, performance, bookings } = data;

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
                "Top 3 Most Popular Cars",
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
        if (performance.nagativeReviewsCount?.result) {
            // count the total number of nagative reviews
            $scope.negativeReviewsCount = performance.negativeReviews.result.reduce((acc, curr) => acc + curr.count, 0);
        }
        

        if (performance.topEarningCars?.top3CarsWithMostEarning) {
            ChartService.createBarChart(
                "bar",
                performance.topEarningCars.top3CarsWithMostEarning.map(car => car._id),
                performance.topEarningCars.top3CarsWithMostEarning.map(car => car.totalRevenue),
                'Total Revenue (₹)',
                "Top 3 Earning Cars",
                "top3CarsWithMostEarning"
            );
        }

        // Booking Charts
        if (bookings.peakHours?.peakBiddingHours) {
            ChartService.createBarChart(
                "line",
                bookings.peakHours.peakBiddingHours.map(hour => formatHour(hour.hour)),
                bookings.peakHours.peakBiddingHours.map(hour => hour.count),
                'Number of Bookings',
                "Peak Booking Hours",
                "hourlyBiddingHeatmap"
            );
        }
        if(bookings.sellerBids?.sellerBids){
            ChartService.createBarChart(
                "line",
                ["yourBids", "otherSellersAvgBids"],
                [bookings.sellerBids.sellerBids[0].totalBids, bookings.otherSellersAvgBids.otherSellersAvgBids[0].avgBids],
                'Number of Bids',
                "your Bids vs Other Sellers Avg Bids",
                "myBidsVsOtherSellersAvgBids"
            )
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
        if(bookings.cityWiseBookings?.cityWiseBookings){
            ChartService.createBarChart(
                "bar",
                bookings.cityWiseBookings.cityWiseBookings.map(city => city._id),
                bookings.cityWiseBookings.cityWiseBookings.map(city => city.count),
                'Number of Bookings',
                "City-wise Bookings",
                "cityWiseBooking"
            )
        }
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
     * Updates analytics data based on API responses
     */
    const updateAnalyticsData = ([overview, performance, bookings]) => {

        console.log(overview, performance, bookings);
        if(bookings.averageRentalDuration){
            $scope.averageRentalDuration = bookings.averageRentalDuration.averageRentalDuration[0].averageRentalDuration;
        }
        if(bookings.repeatingCustomersPercentage){

            $scope.repeatingCustomersPercentage = bookings.repeatingCustomersPercentage.repeatingCustomersPercentage[0].repeatingCustomerPercentage;
        }

        // Update Overview metrics
        if (overview.revenue) {
            $scope.totalRevenue = overview.revenue.totalRevenue || 0;
            $scope.totalFineCollected = overview.revenue.totalFineCollected || 0;
            $scope.numberOfBookings = overview.revenue.totalBookings || 0;
            $scope.averageRevenue = overview.revenue.averageRevenue || 0;
        }

        // Update Performance metrics
        if (performance.negativeReviews) {
            $scope.negativeReviewsCount = performance.negativeReviews.result.reduce((acc, curr) => acc + curr.count, 0);
        }

        // Update Booking metrics
        if (bookings.monthlyBookings) {
            $scope.totalMonthlyBookings = bookings.monthlyBookings.monthWiseBookings.reduce((acc, curr) => acc + curr.count, 0);
        }

        // Create all charts with the updated data
        createCharts({ overview, performance, bookings });
    };

    /**
     * Fetches analytics data from the server uses $q.all to make parallel API calls, updates the scope variables with the results, and handles errors
     * @returns {Promise} Promise that resolves when all data is fetched
     */
    const fetchAnalyticsData = () => {
        if (!validateDateRange()) return;

        const params = {
            startDate: $scope.startDate.toISOString(),
            endDate: $scope.endDate.toISOString()
        };

        $q.all([
            ChartService.getOverviewAnalytics(params),
            ChartService.getPerformanceAnalytics(params),
            ChartService.getBookingAnalytics(params)
        ])
        .then(updateAnalyticsData)
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

    $scope.getAnalytics = (value) => {
        if ($scope.startDate && $scope.endDate) {
            $scope.dateFiltered = true;
            $scope.timePeriod = value || 'last7days';
        } else {
            $scope.dateFiltered = false;
            $scope.timePeriod = $scope.timePeriod || 'last7days';
        }
        fetchAnalyticsData();
    };

    $scope.resetDateFilter = () => {
        $scope.dateFiltered = false;
        initializeDates();
        $scope.timePeriodParams = undefined;
        fetchAnalyticsData();
    };
});