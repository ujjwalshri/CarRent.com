angular.module('myApp').controller('sellerAnalyticsCtrl', function($scope,$q, IDB, ToastService, ChartService, BackButton, ChartService) {
     // retriving the loggedinUser 
    $scope.back = BackButton.back; // back function
    $scope.startDate;
    $scope.endDate;
    $scope.totalRevenue;
    $scope.myBids;
    $scope.otherSellersAvgBids;
    $scope.onGoingBookings;
    $scope.dateFiltered = false;
    $scope.dateFilteredRevenue;
    $scope.totalFineCollected;
    $scope.percentageOfTotalFineCollected = 100;

   

    $scope.init = () => {
        $scope.percentageOfTotalRevenue = 100;
        $scope.months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']; // array of months
        fetchChartDataForSeller();
    }
    // functions to fetch all biddings for a particular seller
    function fetchChartDataForSeller(){
         // Convert to Date objects and strip the time
   if(startDate !== undefined && endDate !== undefined){
    const startDate = new Date($scope.startDate);
    const endDate = new Date($scope.endDate);

    // Set time to midnight for both dates
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    // compare if the startDate is today date or future date
    if (startDate > new Date().setHours(0,0,0,0) || endDate > new Date().setHours(0,0,0,0)) {
        ToastService.error("Start date must be earlier then today.");
        return;
    }

    // Compare only the date
    if (startDate >= endDate) {
       ToastService.error("Start date must be earlier than end date.");
        return;
    }
   }

        const params = {
            startDate: $scope.startDate,
            endDate: $scope.endDate
        }

       $q.all([
       ChartService.getCarDescription(),
       ChartService.getTop3MostPopularCars(params),
       ChartService.getNumberOfBookingsPerCarCityForSeller(params),
       ChartService.getTotalCarsAddedBySeller(params),
       ChartService.getBidsPerLocationTypeForSeller(params),
       ChartService.getTotalBookingRevenueForSeller(params),
       ChartService.onGoingBookingsForSeller(),
       ChartService.myBidsAndOtherSellersAvgBidsForSeller(), 
       ChartService.getcarWiseBookingsForSeller(),
       ChartService.getMonthWiseBookingsForSeller(),
       ChartService.top3CarsWithMostEarning(params),
       ChartService.top3CostumersWithMostBookings(),
       ChartService.peakBiddingHours(params),
       ChartService.getNegativeReviewsPercentage(params)
        // IDB.getAllCarsByUser(loggedInUser.id), // get all cars by the user
        // IDB.getBookingsByOwnerId(loggedInUser.id), // get all biddings for the user's car
        // IDB.getAllBookings(), // get all biddings
        // IDB.getAllUsers() // get all users
       ])
       .then(([carDescription, topCars, topBookingsPerCarCity, totalCarsAdded, bids, totalBookingRevenue ,  onGoingBookings, myBidsVsOtherSellerAvg, carWiseBookings, monthWiseBookings, top3CarsWithMostEarning, top3CostumersWithMostBookings, peakBiddingHours, negativeReviewsPercentage])=>{

        $scope.negativeReviewsPercentage = negativeReviewsPercentage.negativeReviewsPercentage;

      $scope.totalFineCollected = totalBookingRevenue?.allTimeRevenue?.totalFineCollected || 0;
      $scope.totalRevenue = (totalBookingRevenue?.allTimeRevenue?.totalRevenue+totalBookingRevenue?.allTimeRevenue?.totalFineCollected|| 0) + (totalBookingRevenue?.totalRevenueData?.totalFineCollected || 0);

      if(totalBookingRevenue?.dateFilteredRevenue){
        $scope.dateFiltered = true;


        $scope.dateFilteredRevenue = totalBookingRevenue?.dateFilteredRevenue.totalRevenue + totalBookingRevenue?.dateFilteredRevenue.totalFineCollected;
        $scope.totalFineCollected = totalBookingRevenue?.dateFilteredRevenue.totalFineCollected;


        $scope.percentageOfTotalFineCollected = $scope.totalFineCollected? ($scope.totalFineCollected / $scope.totalRevenue) *100: 0;
        $scope.percentageOfTotalRevenue = $scope.totalRevenue 
        ? ($scope.dateFilteredRevenue / $scope.totalRevenue) *100
        : 0;

      }
     
       $scope.myBids = myBidsVsOtherSellerAvg?.result?.[0]?.totalBids || 0;
       $scope.otherSellersAvgBids = myBidsVsOtherSellerAvg?.res1?.[0]?.avgBids || 0;
       $scope.onGoingBookings = onGoingBookings?.result?.length === 0 ? 0 : (onGoingBookings?.result?.[0]?.count || 0);
      

       $scope.numberOfCars = totalCarsAdded?.totalCarsAdded?.[0]?.count || 0;
        
        ChartService.createBarChart("line", peakBiddingHours.peakBiddingHours.map(hour => {
            const hr = hour._id;
            const suffix = hr >= 12 ? "PM" : "AM";
            const formattedHour = hr === 0 ? "12 AM" : hr === 12 ? "12 PM" : `${hr % 12} ${suffix}`;
            return formattedHour;
        }), peakBiddingHours.peakBiddingHours.map(hour => hour.count), 'Number of bids',"Hourly bidding heatmap","hourlyBiddingHeatmap"); // call the createBarChart function from the ChartService
        ChartService.createBarChart("bar", top3CostumersWithMostBookings.top3CostumersWithMostBookings.map(costumer => costumer._id), top3CostumersWithMostBookings.top3CostumersWithMostBookings.map(costumer => costumer.count), 'Number of bookings',"Top 3 costumers with most bookings","top3CostumersWithMostBookings"); // call the createBarChart function from the ChartService
        ChartService.createBarChart("bar", top3CarsWithMostEarning.top3CarsWithMostEarning.map(car => car._id), top3CarsWithMostEarning.top3CarsWithMostEarning.map(car => car.totalRevenue), 'Number of earnings',"Top 3 cars with most earnings","top3CarsWithMostEarning"); // call the createBarChart function from the ChartService
        ChartService.createBarChart("bar", bids.carCountByLocalVsOutstationVsBoth.map(obj=> obj._id),bids.carCountByLocalVsOutstationVsBoth.map(obj=>obj.count), 'Number of bids',"Biddings on my cars by fuel type","petrolVsDeiselVsElectric"); // call the createBarChart function from the ChartService
        ChartService.createBarChart("bar", monthWiseBookings.monthWiseBookings.map((booking)=> booking._id),monthWiseBookings.monthWiseBookings.map((booking)=>booking.count), 'Number of bookings',"Month wise bookings","numberOfBookingsPerMonth"); // call the createBarChart function from the ChartService
        ChartService.createBarChart("bar", topBookingsPerCarCity.numberOfBidsPerLocation.map(city => city._id), topBookingsPerCarCity.numberOfBidsPerLocation.map(city => city.count), 'Number of bids',"City Wise biddings on my cars","cityWiseBooking"); // call the createBarChart function from the ChartService
        ChartService.createBarChart("bar", carWiseBookings.carWiseBookings.map(car => car._id), carWiseBookings.carWiseBookings.map(car => car.count), 'Number  of Bookings',"Cars","carAndBookingsChart"); // call the createBarChart function from the ChartService
        ChartService.createBarChart("bar", topCars.top3MostPopularCars.map(car => car._id), topCars.top3MostPopularCars.map(car => car.count), 'Number of bids',"Top 3 Most Popular cars of yours","myMostPopularCar"); // call the createBarChart function from the ChartService
        ChartService.createPieChart(["SUV", "Sedan"],[carDescription.suvVsSedan[1].count, carDescription.suvVsSedan[0].count], 'Number of cars suvVsSedans', 'suvVsSedanForSeller'); // call the createPieChart function from the ChartService
        createSellerCharts(); // create the charts
       })
       .catch((err)=>{
         ToastService.error(`error fetching seller data ${err}` ); 
       })
    }


 $scope.getAnalytics = ()=>{
    $scope.dateFiltered = true;
    fetchChartDataForSeller();
 }
 $scope.resetDateFilter = ()=>{ 
    $scope.dateFiltered = false;
    $scope.startDate = undefined;
    $scope.endDate = undefined;
    fetchChartDataForSeller();
 }

    function createSellerCharts(){
    
        createMyBiddingsVsOtherSellersAvgChart(); // creating the multiline charts
        createLastWeekBidsVsSecondLastWeekBidsChart(); // create the multiline charts
    }


    function createMyBiddingsVsOtherSellersAvgChart(){
        const chartData = {
            labels: ['You', 'Other Sellers'],
            data: [$scope.myBids, $scope.otherSellersAvgBids],
            title: "Your biddings in the last 7 days vs other sellers average",
            label: "Number of bids"
        };
        // create a line chart with two lines one for the user and the other for the average of other sellers
        const labels = ['You', 'Other Sellers'];
        const data = [$scope.myBids, $scope.otherSellersAvgBids];
        var ctx = document.getElementById("biddingsInLast7days").getContext("2d");
        const myBiddingsVsOtherSellersAvgChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Number of bids',
                    data: data,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(54, 162, 235, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(54, 162, 235, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                title: {
                    display: true,
                    text: "Your biddings in the last 7 days vs other sellers average"
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        });
    }
    /*
    function to create a line chart for the user's biddings in the last week vs the biddings in the second last week
    @params none
    @returns none
    */
    function createLastWeekBidsVsSecondLastWeekBidsChart() {
        // Get the canvas context
        var ctx = document.getElementById("bidComparasion").getContext("2d");
    
        // Labels (X-Axis)
        const labels = ['Second Last Week Bids', 'Last Week Bids'];
    
        // Data for the user and the average of other sellers
        const userBidsData = [$scope.secondLastWeekBids.length, $scope.lastWeekBids.length];
        const avgOtherSellersData = [$scope.secondLastWeekAvgBids, $scope.lastWeekAvgBids];
    
        console.log("User Bids:", userBidsData);
        console.log("Average Other Sellers Bids:", avgOtherSellersData);
    
        // Create Chart
        const lastWeekBidsVsSecondLastWeekBidsChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: '',
                        data: userBidsData,
                        borderColor: 'rgba(255, 99, 132, 1)',
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        borderWidth: 2,
                        pointRadius: 5,
                        
                        fill: false,
                        tension: 0.3 
                    },
                    {
                        label:'',
                        data: avgOtherSellersData,
                        borderColor: 'rgba(54, 162, 235, 1)',
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        borderWidth: 2,
                        pointRadius: 5,
                        
                        fill: false,
                        tension: 0.3 
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    title: {
                        display: true,
                        text: "Your Biddings vs Other Sellers (Last 2 Weeks)",
                        font: {
                            size: 16
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: "Number of Bids"
                        },
                        ticks: {
                            stepSize: 1
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: "Weeks"
                        }
                    }
                }
            }
        });
    }
    
});