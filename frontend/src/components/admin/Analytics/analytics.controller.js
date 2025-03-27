angular
  .module("myApp")
  .controller("analyticsCtrl", function ($scope, $q, IDB, Booking, ToastService,ChartService) {
    $scope.startDate;
    $scope.endDate;
    $scope.init = () => {
      // Fetch all users
      $scope.calculateBookingPrice = Booking.calculate; // function to calculate the booking price from the booking factory
      fetchChartsData();
    };

    $scope.filterByDate = ()=>{
      fetchChartsData();
    }

    /*
     Function to fetch all the data for the charts
    */
    function fetchChartsData() {
      if(startDate !== undefined && endDate !== undefined){
        const startDate = new Date($scope.startDate);
        const endDate = new Date($scope.endDate);
    
        // Set time to midnight for both dates
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);
    
        // Compare only the date
        if (startDate >= endDate) {
            alert("Start date must be earlier than end date.");
            return;
        }
       }
      const params = {
        startDate: $scope.startDate || undefined,
        endDate: $scope.endDate || undefined,
      }
      $q.all([
        ChartService.getTop10MostPopularCarsForAdmin(params),
        ChartService.getSuvVsSedanForAdmin(params),
        ChartService.top3MostReviewedCarsForAdmin(params),
        ChartService.top3OwnersWithMostCarsAddedForAdmin(params),
        ChartService.getOngoingBookingsForAdmin(),
        ChartService.getAverageBookingDurationForAdmin(),
        ChartService.getBiddingConversionRateForAdmin(), 
        ChartService.getNumberOfBlockedUsersForAdmin(), 
        ChartService.numberOfBiddingPerCarCityForAdmin(),
        ChartService.numberOfOwnersPerCityForAdmin(),
        ChartService.getUserDescriptionForAdmin(), 
        ChartService.getnumberOfBuyersPerCityForAdmin(),
        ChartService.newUsersInLast30DaysForAdmin()
      ])
        .then(([top10PopularCars, carData, top3MostReviewed, top3Sellers, ongoingBookings, averageBookingDuration, biddingConversionRate, blockedUsers, numberOfBiddingPerCarCity , numberOfOwnersPerCity, userDescription , numberOfBuyerPerCity, newUsersInLast30Days]) => {

        console.log(newUsersInLast30Days);
        $scope.buyers = userDescription[0].count;
        $scope.sellers = userDescription[1].count;
        $scope.blockedUsers = blockedUsers;
        $scope.newUsers = newUsersInLast30Days;

      $scope.biddingConversionRate = biddingConversionRate.conversionRate.toFixed(2);
       $scope.averageBookingDuration = averageBookingDuration.avgDuration.toFixed(2);
        $scope.ongoingBookings = ongoingBookings.length===0  ? 0 : ongoingBookings[0].count;
          // 

         $scope.suvs = carData.suvVsSedan[0].count;
         $scope.sedans = carData.suvVsSedan[1].count;
          ChartService.createBarChart( "bar",numberOfOwnersPerCity.map((owner) => owner._id),numberOfOwnersPerCity.map((owner) => owner.count),  "Number of Owner per city","number of owners per city","ownersPerCity"); // create a chart for the top 5 most popular cars
          ChartService.createBarChart( "bar",numberOfBuyerPerCity.map((buyer) => buyer._id),numberOfBuyerPerCity.map((buyer) => buyer.count),  "Number of Buyers per city","number of buyers per city","buyersPerCity"); // create a chart for the top 5 most popular cars
          ChartService.createBarChart( "bar",top10PopularCars.result.map((car) => car._id),top10PopularCars.result.map((car) => car.count),  "Number of Biddings","Top 10 most popular car models on the platform","top10Cars"); // create a chart for the top 5 most popular cars
          ChartService.createPieChart(["SUV", "Sedan"], [$scope.suvs, $scope.sedans], "SUV vs Sedan on the platform", "suvVsSedan"); // create a pie chart for the suv and sedan cars
          ChartService.createPieChart(["Buyers", "Sellers"], [$scope.sellers, $scope.buyers], "Sellers vs Buyers on the platform", "userDescriptionChart"); // create a pie chart for the suv and sedan cars
          ChartService.createBarChart("bar", top3MostReviewed.result.map((car) => car._id),top3MostReviewed.result.map((car) => car.count),"Number of Reviews","Top 3 most reviewed cars","top5MostReviewedCars") // create a chart for the top 5 most reviewed cars
          ChartService.createBarChart("bar",top3Sellers.result
            .map((owner) => owner._id), top3Sellers.result
            .map((owner) => owner.count)
            , "Number of Cars Added", "Top 3 Sellers with most cars added","top3Sellers"); // create the top 3 sellers with most cars added chart
        })
        .catch((err) => {
          ToastService.error(`error fetching the chart data ${err}`);
        });
    }
   
  });