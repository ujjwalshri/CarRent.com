

angular
  .module("myApp")
  .controller("analyticsCtrl", function ($scope, $q, IDB, Booking, ToastService,ChartService, City,$window ) {
    $scope.startDate;
    $scope.endDate;
    $scope.userEngagementPercentage;
    $scope.topSellersWithMostEarnings;
    $scope.top10BuyersWithMostBookings;
    $scope.indianCitiesAndLongitudeAndLatitudeMap = City.getIndianCitiesAndLongitudeMap();
    $scope.init = () => {
     
      // Fetch all users
     
      $scope.calculateBookingPrice = Booking.calculate; // function to calculate the booking price from the booking factory

      fetchChartsData();
    
    };
    window.initMap = function(heatmapData, htmlElementId) {
  
      console.log($scope.indianCitiesAndLongitudeAndLatitudeMap);
    
      var map = new google.maps.Map(document.getElementById(htmlElementId), {
        center: { lat: 20.5937, lng: 78.9629 }, // indian map center
          zoom: 5,
          mapTypeId: 'satellite'
      });
    
      var heatmap = new google.maps.visualization.HeatmapLayer({
          data: heatmapData
      });
     
      heatmap.setMap(map);

      Object.keys($scope.indianCitiesAndLongitudeAndLatitudeMap).forEach(function(city) {
        var coord = $scope.indianCitiesAndLongitudeAndLatitudeMap[city];
    
        // Create a div to display the label
        var labelDiv = document.createElement('div');
        labelDiv.style.position = 'absolute';
        labelDiv.style.fontSize = '16px';
        labelDiv.style.fontWeight = 'bold';
        labelDiv.style.color = 'black';
        labelDiv.innerText = city;
    
        // Create an overlay to add the label to the map
        var labelOverlay = new google.maps.OverlayView();
        
        labelOverlay.onAdd = function() {
            var layer = this.getPanes().overlayLayer;
            layer.appendChild(labelDiv);
        };
    
        labelOverlay.draw = function() {
            var projection = this.getProjection();
            var position = projection.fromLatLngToDivPixel(new google.maps.LatLng(coord.lat, coord.lng));
            labelDiv.style.left = position.x + 'px';
            labelDiv.style.top = position.y + 'px';
        };
    
        // Add the overlay to the map
        labelOverlay.setMap(map);
    });
    
      
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
        endDate.setHours(23, 59, 59, 999);
    
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
        ChartService.newUsersInLast30DaysForAdmin(),
        ChartService.getUserGrowthForAdmin(params),
        ChartService.getUserEngagementPercentageForAdmin(params),
        ChartService.getTop10SellersWithMostEarningsForAdmin(params), 
        ChartService.topBuyersWithMostBookingsForAdmin(params)
      ])
        .then(([top10PopularCars, carData, top3MostReviewed, top3Sellers, ongoingBookings, averageBookingDuration, biddingConversionRate, blockedUsers, numberOfBiddingPerCarCity , numberOfOwnersPerCity, userDescription , numberOfBuyerPerCity, newUsersInLast30Days, userGrowth, userEngagement, top10SellersWithMostEarnings, topBuyersWithMostBookings]) => {
          // console.log(numberOfOwnersPerCity);
          console.log(numberOfBuyerPerCity);
          $scope.ownerCountsPerCity = numberOfOwnersPerCity;
          console.log($scope.ownerCountsPerCity);

          // console.log($scope.ownerCountsPerCity);
          console.log($scope.indianCitiesAndLongitudeAndLatitudeMap);
          let heatmapData = [];
        
          numberOfOwnersPerCity.forEach(function(item) {
              var city = item._id;
              var count = item.count;
  
              if ($scope.indianCitiesAndLongitudeAndLatitudeMap[city]) {
                  var latLng = new google.maps.LatLng(
                      $scope.indianCitiesAndLongitudeAndLatitudeMap[city].lat,
                      $scope.indianCitiesAndLongitudeAndLatitudeMap[city].lng
                  );
                  heatmapData.push({ location: latLng, weight: count });
              }
          });

          let heatmapDataForBuyers = [];
         numberOfBuyerPerCity.forEach((buyer)=>{
          let city = buyer._id;
          let count = buyer.count;
          if ($scope.indianCitiesAndLongitudeAndLatitudeMap[city]) {
            let latLng = new google.maps.LatLng(
                $scope.indianCitiesAndLongitudeAndLatitudeMap[city].lat,
                $scope.indianCitiesAndLongitudeAndLatitudeMap[city].lng
            );
            heatmapDataForBuyers.push({ location: latLng, weight: count });
        }
         })

  
          console.log("Final Heatmap Data: ", heatmapData);
           console.log($scope.indianCitiesAndLongitudeAndLatitudeMap);
          $window.initMap(heatmapData,'map');
          $window.initMap(heatmapDataForBuyers, 'buyerHeatMap')
        
          $scope.userEngagementPercentage = userEngagement.engagementPercentage.toFixed(2);
          $scope.top10BuyersWithMostBookings = topBuyersWithMostBookings;
          $scope.top10SellersWithMostEarnings = top10SellersWithMostEarnings.topSellers;
          

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
         ChartService.createBarChart("line", userGrowth.map((user) => user._id), userGrowth.map((user) => user.count), "User Growth", "User Growth", "userGrowth"); // create a chart for the user growth
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

    $scope.sendCongratulationMail = (data) => {
      
      ChartService.sendCongratulationMail(data).then((response)=>{
        ToastService.success(`Congratulation mail sent successfully`);
      }).catch((err)=>{
        ToastService.error(`error sending the congratulation mail ${err}`);
      });
    }

   

   
  });

