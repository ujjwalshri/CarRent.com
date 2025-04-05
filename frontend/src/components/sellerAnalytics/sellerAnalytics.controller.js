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
        $scope.myBids = 0;
        $scope.otherSellersAvgBids = 0;
        $scope.onGoingBookings = 0;
        $scope.dateFiltered = false;
        $scope.dateFilteredRevenue = 0;
        $scope.totalFineCollected = 0;
        $scope.averageRentalDuration = 0;
        $scope.numberOfBookings = 0;
        $scope.repeatingCustomerPercentage = 0;
        $scope.percentageOfTotalRevenue = 100;
        $scope.percentageOfTotalFineCollected = 100;
        $scope.showDateFilter = true;
        $scope.timePeriod = 'last7days';
    };

    /**
     * Validates date range for analytics
     * @returns {boolean} Whether dates are valid
     */
    const validateDateRange = () => {
        if ($scope.startDate === undefined || $scope.endDate === undefined) {
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
        const {
            carWiseNegativeReviews,
            peakBiddingHours,
            top3CostumersWithMostBookings,
            top3CarsWithMostEarning,
            bids,
            monthWiseBookings,
            topBookingsPerCarCity,
            carWiseBookings,
            topCars
        } = data;

        // Car-wise negative reviews chart
        ChartService.createBarChart(
            "bar",
            carWiseNegativeReviews.result.map(car => car._id),
            carWiseNegativeReviews.result.map(car => car.count),
            'Number of negative reviews',
            "Car Wise Negative Reviews",
            "carWiseNegativeReviews"
        );

        // Peak bidding hours chart
        ChartService.createBarChart(
            "line",
            peakBiddingHours.peakBiddingHours.map(hour => formatHour(hour.hour)),
            peakBiddingHours.peakBiddingHours.map(hour => hour.count),
            'Number of bids',
            "Hourly bidding",
            "hourlyBiddingHeatmap"
        );

        // Top customers chart
        ChartService.createBarChart(
            "bar",
            top3CostumersWithMostBookings.top3CostumersWithMostBookings.map(customer => customer._id),
            top3CostumersWithMostBookings.top3CostumersWithMostBookings.map(customer => customer.count),
            'Number of bookings',
            "Top 3 customers with most bookings",
            "top3CostumersWithMostBookings"
        );

        // Top earning cars chart
        ChartService.createBarChart(
            "bar",
            top3CarsWithMostEarning.top3CarsWithMostEarning.map(car => car._id),
            top3CarsWithMostEarning.top3CarsWithMostEarning.map(car => car.totalRevenue),
            'Number of earnings',
            "Top 3 cars with most earnings",
            "top3CarsWithMostEarning"
        );

        // Fuel type chart
        ChartService.createBarChart(
            "bar",
            bids.carCountByLocalVsOutstationVsBoth.map(obj => obj._id),
            bids.carCountByLocalVsOutstationVsBoth.map(obj => obj.count),
            'Number of bids',
            "Biddings on my cars by fuel type",
            "petrolVsDeiselVsElectric"
        );

        // Monthly bookings chart
        ChartService.createBarChart(
            "bar",
            monthWiseBookings.monthWiseBookings.map(booking => booking._id),
            monthWiseBookings.monthWiseBookings.map(booking => booking.count),
            'Number of bookings',
            "Month wise bookings",
            "numberOfBookingsPerMonth"
        );

        // City-wise bookings chart
        ChartService.createBarChart(
            "bar",
            topBookingsPerCarCity.numberOfBidsPerLocation.map(city => city._id),
            topBookingsPerCarCity.numberOfBidsPerLocation.map(city => city.count),
            'Number of bids',
            "City Wise biddings on my cars",
            "cityWiseBooking"
        );

        // Car-wise bookings chart
        ChartService.createBarChart(
            "bar",
            carWiseBookings.carWiseBookings.map(car => car._id),
            carWiseBookings.carWiseBookings.map(car => car.count),
            'Number of Bookings',
            "Cars",
            "carAndBookingsChart"
        );

        // Popular cars chart
        ChartService.createBarChart(
            "bar",
            topCars.top3MostPopularCars.map(car => car._id),
            topCars.top3MostPopularCars.map(car => car.count),
            'Number of bids',
            "Top 3 Most Popular cars of yours",
            "myMostPopularCar"
        );

        // Create bidding comparison chart
        createBiddingComparisonChart();
    };

    /**
     * Creates comparison chart between seller's bids and other sellers' average
     */
    const createBiddingComparisonChart = () => {
        const ctx = document.getElementById("myBidsVsOtherSellersAvgBids").getContext("2d");
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['You', 'Other Sellers'],
                datasets: [{
                    label: 'Number of bids',
                    data: [$scope.myBids, $scope.otherSellersAvgBids],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(255, 206, 86, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(255, 206, 86, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                title: {
                    display: true,
                    text: "Your biddings vs other sellers average bids"
                },
                scales: {
                    yAxes: [{
                        ticks: { beginAtZero: true }
                    }]
                }
            }
        });
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
     * Updates analytics data based on API response
     */
    const updateAnalyticsData = (response) => {
        const [
            carDescription, 
            topCars, 
            topBookingsPerCarCity, 
            totalCarsAdded, 
            bids, 
            totalBookingRevenue,
            onGoingBookings, 
            myBidsVsOtherSellerAvg, 
            carWiseBookings, 
            monthWiseBookings, 
            top3CarsWithMostEarning, 
            top3CostumersWithMostBookings, 
            peakBiddingHours, 
            negativeReviewsPercentage, 
            averageRentalDuration, 
            repeatingCustomerData, 
            numberOfBookings, 
            carWiseNegativeReviews
        ] = response;

        // Update scope variables with response data
        $scope.numberOfBookings = numberOfBookings?.result?.[0]?.count || 0;
        $scope.averageRentalDuration = averageRentalDuration.averageRentalDuration[0]?.averageRentalDuration || 0;
        $scope.repeatingCustomerPercentage = repeatingCustomerData.repeatingCustomerPercentage;
        $scope.negativeReviewsPercentage = negativeReviewsPercentage.negativeReviewsPercentage;
        $scope.totalFineCollected = totalBookingRevenue?.allTimeRevenue?.totalFineCollected || 0;
        $scope.totalRevenue = (totalBookingRevenue?.allTimeRevenue?.totalRevenue + totalBookingRevenue?.allTimeRevenue?.totalFineCollected || 0) + 
                             (totalBookingRevenue?.totalRevenueData?.totalFineCollected || 0);
        $scope.numberOfCars = totalCarsAdded?.totalCarsAdded?.[0]?.count || 0;

        if(totalBookingRevenue?.dateFilteredRevenue) {
            $scope.dateFiltered = true;
            $scope.dateFilteredRevenue = totalBookingRevenue.dateFilteredRevenue.totalRevenue + 
                                       totalBookingRevenue.dateFilteredRevenue.totalFineCollected;
            $scope.totalFineCollected = totalBookingRevenue.dateFilteredRevenue.totalFineCollected;
            $scope.percentageOfTotalFineCollected = $scope.totalFineCollected ? 
                ($scope.totalFineCollected / $scope.totalRevenue) * 100 : 0;
            $scope.percentageOfTotalRevenue = $scope.totalRevenue ? 
                ($scope.dateFilteredRevenue / $scope.totalRevenue) * 100 : 0;
        }

        $scope.myBids = myBidsVsOtherSellerAvg?.result?.[0]?.totalBids || 0;
        $scope.otherSellersAvgBids = myBidsVsOtherSellerAvg?.res1?.[0]?.avgBids || 0;
        $scope.onGoingBookings = onGoingBookings?.result?.length === 0 ? 
            0 : (onGoingBookings?.result?.[0]?.count || 0);

        // Create all charts with the updated data
        createCharts({
            carWiseNegativeReviews,
            peakBiddingHours,
            top3CostumersWithMostBookings,
            top3CarsWithMostEarning,
            bids,
            monthWiseBookings,
            topBookingsPerCarCity,
            carWiseBookings,
            topCars
        });
    };

    /**
     * Fetches analytics data from the server
     */
    const fetchChartDataForSeller = () => {
        if (!validateDateRange()) return;

        const params = {
            startDate: $scope.startDate,
            endDate: $scope.endDate
        };

        $q.all([
            ChartService.getCarDescriptionForSeller(params),
            ChartService.getTop3MostPopularCars(params),
            ChartService.getNumberOfBookingsPerCarCityForSeller(params),
            ChartService.getTotalCarsAddedBySeller(params),
            ChartService.getBidsPerLocationTypeForSeller(params),
            ChartService.getTotalBookingRevenueForSeller(params),
            ChartService.onGoingBookingsForSeller(),
            ChartService.myBidsAndOtherSellersAvgBidsForSeller(params),
            ChartService.getcarWiseBookingsForSeller(params),
            ChartService.getMonthWiseBookingsForSeller(params),
            ChartService.top3CarsWithMostEarning(params),
            ChartService.top3CostumersWithMostBookings(params),
            ChartService.peakBiddingHours(params),
            ChartService.getNegativeReviewsPercentage(params),
            ChartService.getAverageRentalDurationForSeller(params),
            ChartService.getRepeatingCustomersPercentageForSeller(params),
            ChartService.getNumberOfBookingsForSeller(params),
            ChartService.getCarWiseNegativeReviews(params)
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
        fetchChartDataForSeller();
    };

    $scope.getAnalytics = (value) => {
        if ($scope.startDate && $scope.endDate) {
            $scope.dateFiltered = true;
            $scope.timePeriod = value || 'last7days';
        } else {
            $scope.dateFiltered = false;
            $scope.timePeriod = $scope.timePeriod || 'last7days';
        }
        fetchChartDataForSeller();
    };

    $scope.resetDateFilter = () => {
        $scope.dateFiltered = false;
        initializeDates();
        $scope.timePeriodParams = undefined;
        fetchChartDataForSeller();
    };
});