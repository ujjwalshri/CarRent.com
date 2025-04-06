angular
  .module("myApp")
  .controller("analyticsCtrl", function ($scope, $q, ToastService, ChartService, City, $window) {
    // Initialize date range with proper Date objects
    $scope.startDate = new Date(new Date().setDate(new Date().getDate() - 7));
    $scope.endDate = new Date();
    
    // Analytics data collections
    $scope.userEngagementPercentage;
    $scope.userGrowthFilter = "city";
    $scope.topSellersWithMostEarnings;
    $scope.top10BuyersWithMostBookings;
    console.log($scope.userGrowthFilter);
    
    // Geographical data for mapping
    $scope.indianCitiesAndLongitudeAndLatitudeMap = City.getIndianCitiesAndLongitudeMap();
    
    /**
     * Initialize the analytics controller
     * Loads necessary data and creates visualization components
     */
    $scope.init = () => {
      // Load initial chart data
      fetchChartsData();
    };
    
    /**
     * Formats date for API requests
     * @param {Date} date - Date to format
     * @returns {string} ISO formatted date string
     */
    function formatDateForAPI(date) {
      if (!date) return undefined;
      const d = new Date(date);
      return d.toISOString();
    }
    
    /**
     * Validates date range
     * @returns {boolean} true if date range is valid
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
     * Initializes and configures Google Maps for heatmap visualization
     * @param {Array} heatmapData - Location data with weights for heatmap generation
     * @param {String} htmlElementId - DOM element ID where the map will be rendered
     */
    window.initMap = function(heatmapData, htmlElementId) {
      console.log($scope.indianCitiesAndLongitudeAndLatitudeMap);
      
      // Create a new Google Map centered on India
      var map = new google.maps.Map(document.getElementById(htmlElementId), {
        center: { lat: 20.5937, lng: 78.9629 }, // Indian map center
        zoom: 5,
        mapTypeId: 'satellite'
      });
      
      // Create and configure the heatmap layer
      var heatmap = new google.maps.visualization.HeatmapLayer({
        data: heatmapData
      });
      
      // Add the heatmap layer to the map
      heatmap.setMap(map);
      
      // Add city name labels to the map
      Object.keys($scope.indianCitiesAndLongitudeAndLatitudeMap).forEach(function(city) {
        var coord = $scope.indianCitiesAndLongitudeAndLatitudeMap[city];
        
        // Create a div element for the city label
        var labelDiv = document.createElement('div');
        labelDiv.style.position = 'absolute';
        labelDiv.style.fontSize = '8px';
        labelDiv.style.fontWeight = 'bold';
        labelDiv.style.color = 'white';
        labelDiv.innerText = city;
        
        // Create an overlay to position the label on the map
        var labelOverlay = new google.maps.OverlayView();
        
        // Define what happens when the overlay is added to the map
        labelOverlay.onAdd = function() {
          var layer = this.getPanes().overlayLayer;
          layer.appendChild(labelDiv);
        };
        
        // Define how to position the label based on map projection
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
    
    /**
     * Applies date range filter and refreshes all charts
     * Triggered when user applies date filters
     */
    $scope.filter = () => {
      if (!validateDateRange()) {
        return;
      }
      fetchChartsData();
    }

    $scope.filterByUserGrowth = (filter) => {
      if (!validateDateRange()) {
        return;

      }
      $scope.userGrowthFilter = filter;
      fetchChartsData();
    }
    
    /**
     * Fetches all analytics data for charts and visualizations
     * Uses validated and formatted dates for API calls
     */
    function fetchChartsData() {
      // Prepare parameters for API calls with formatted dates
      const params = {
        startDate: formatDateForAPI($scope.startDate),
        endDate: formatDateForAPI($scope.endDate)
      };
      const userGrowthParams = {
        startDate: formatDateForAPI($scope.startDate),
        endDate: formatDateForAPI($scope.endDate),
        filter: $scope.userGrowthFilter
      };
      console.log(userGrowthParams);
      
      console.log('API Parameters:', params);
      
      // Execute multiple API calls in parallel for better performance
      $q.all([
        ChartService.getChartsData(params),
        ChartService.getGeneralAnalyticsForAdmin(params),
        ChartService.getOverviewStatsForAdmin(params), 
        ChartService.numberOfUsersPerCityForAdmin(),
        ChartService.getTopPerformersForAdmin(params), 
      ])
        .then(([
          chartsData, 
          generalAnalytics, 
          overviewStats, 
          usersPerCity, 
          topPerformers, 
        ]) => {
          // Process city owner distribution data
          $scope.ownerCountsPerCity = usersPerCity.sellers;
          $scope.buyerCountsPerCity = usersPerCity.buyers;
          
          // Prepare heatmap data for owners per city
          let heatmapData = [];
          usersPerCity.sellers.forEach(function(item) {
            var city = item._id;
            var count = item.count;
            
            // Map city name to geographic coordinates if available
            if ($scope.indianCitiesAndLongitudeAndLatitudeMap[city]) {
              var latLng = new google.maps.LatLng(
                $scope.indianCitiesAndLongitudeAndLatitudeMap[city].lat,
                $scope.indianCitiesAndLongitudeAndLatitudeMap[city].lng
              );
              heatmapData.push({ location: latLng, weight: count });
            }
          });
          
          // Prepare heatmap data for buyers per city
          let heatmapDataForBuyers = [];
          usersPerCity.buyers.forEach((buyer) => {
            let city = buyer._id;
            let count = buyer.count;
            if ($scope.indianCitiesAndLongitudeAndLatitudeMap[city]) {
              let latLng = new google.maps.LatLng(
                $scope.indianCitiesAndLongitudeAndLatitudeMap[city].lat,
                $scope.indianCitiesAndLongitudeAndLatitudeMap[city].lng
              );
              heatmapDataForBuyers.push({ location: latLng, weight: count });
            }
          });

          let cityWiseBiddingsHeatmapData = [];
          chartsData.numberOfBiddingsPerCity.forEach((city) => {
            let cityName = city._id;
            let count = city.count;
            if ($scope.indianCitiesAndLongitudeAndLatitudeMap[cityName]) {
              let latLng = new google.maps.LatLng($scope.indianCitiesAndLongitudeAndLatitudeMap[cityName].lat, $scope.indianCitiesAndLongitudeAndLatitudeMap[cityName].lng);
              cityWiseBiddingsHeatmapData.push({ location: latLng, weight: count });
            }
          });

          
          console.log("Final Heatmap Data: ", heatmapData);
          console.log($scope.indianCitiesAndLongitudeAndLatitudeMap);
          
          // Initialize maps with heatmap data
          $window.initMap(heatmapData, 'map');
          $window.initMap(heatmapDataForBuyers, 'buyerHeatMap');
          $window.initMap(cityWiseBiddingsHeatmapData, 'cityWiseBookings');
          
          // Process and store key metrics for display
          $scope.userEngagementPercentage = generalAnalytics.engagementPercentage?.toFixed(2);
          $scope.top10BuyersWithMostBookings = topPerformers.topBuyers;
          $scope.top10SellersWithMostEarnings = topPerformers.topSellers;
          

          $scope.blockedUsers = generalAnalytics.totalNumberOfBlockedUsers;
          $scope.newUsers = overviewStats.newUsers[0].count;
          
          // Process key performance indicators
          $scope.biddingConversionRate = overviewStats.biddingConversionRate[0].conversionRate?.toFixed(2);
          $scope.averageBookingDuration = generalAnalytics.avgDuration.toFixed(2);
          $scope.ongoingBookings = generalAnalytics.ongoingBookings;
          
          // Process car type distribution data
        

          console.log($scope.suvs, $scope.sedans, $scope.truck, $scope.supercars);
          
          // Create all charts using the ChartService
          
          // User growth over time chart
          ChartService.createBarChart(
            "line", 
            chartsData.userGrowth.map((user) => user._id), 
            chartsData.userGrowth.map((user) => user.count), 
            "User Growth", 
            "User Growth", 
            "userGrowth"
          );
          
          // Owners per city distribution chart
          ChartService.createBarChart(
            "bar",
            usersPerCity.sellers.map((owner) => owner._id),
            usersPerCity.sellers.map((owner) => owner.count), 
            "Number of Owner per city",
            "number of owners per city",
            "ownersPerCity"
          );


        

          // Top 10 highest earning cities chart
          ChartService.createBarChart(
            "bar",
           chartsData.highestEarningCities.map((city) => city._id),
           chartsData.highestEarningCities.map((city) => city.totalEarnings),
            "Earnings in USD ($)",
            "Top 5 highest revenue generating cities",
            "topHighestEarningCities"
          );
          
          // Buyers per city distribution chart
          ChartService.createBarChart(
            "bar",
            usersPerCity.buyers.map((buyer) => buyer._id),
            usersPerCity.buyers.map((buyer) => buyer.count), 
            "Number of Buyers per city",
            "number of buyers per city",
            "buyersPerCity"
          );
          
          // Top 10 most popular car models chart
          ChartService.createBarChart(
            "bar",
            chartsData.top10PopularCarModels.map((car) => car._id),
            chartsData.top10PopularCarModels.map((car) => car.count), 
            "Number of Biddings",
            "Top 10 most popular car models on the platform",
            "top10Cars"
          );
          
          // SUV vs Sedan vs truck vs supercars distribution pie chart
          ChartService.createBarChart(
            "bar", 
            chartsData.carDescription.map((car) => car._id),
            chartsData.carDescription.map((car) => car.count),
            "Number of cars",
            "car category and their type on the platform",
            "carDescription"
          );
          
          
          // Top 3 most reviewed cars chart
          ChartService.createBarChart(
            "bar", 
            chartsData.top3MostReviewedCars.map((car) => car._id),
            chartsData.top3MostReviewedCars.map((car) => car.count),
            "Number of Reviews",
            "Top 3 most reviewed cars",
            "top5MostReviewedCars"
          );
          
          // Top 3 sellers with most cars added chart
          ChartService.createBarChart(
            "bar",
            chartsData.top3OwnersWithMostCarsAdded.map((owner) => owner._id), 
            chartsData.top3OwnersWithMostCarsAdded.map((owner) => owner.count), 
            "Number of Cars Added", 
            "Top 3 Sellers with most cars added",
            "top3Sellers"
          );
        })
        .catch((err) => {
          console.error('Error fetching analytics data:', err);
          ToastService.error('Failed to fetch analytics data');
        });
    }
    
    /**
     * Sends congratulation email to top performing users
     * @param {Object} data - User data for email recipient
     */
    $scope.sendCongratulationMail = (data) => {
      // Create a formatted object with the required fields
      let emailData = {};
      
      // Check if the data is from a seller or buyer based on available fields
      if (data.totalEarnings !== undefined) {
        // It's a seller - need email and amount
        emailData = {
          email: data.ownerEmail, // Use ownerEmail from seller data
          amount: data.totalEarnings + (data.totalFine || 0), // Include fine if available
          startDate: $scope.startDate,
          endDate: $scope.endDate
        };
      } else if (data.count !== undefined) {
        // It's a buyer - need email and totalBookings
        emailData = {
          email: data.buyerEmail, // Use buyerEmail from buyer data
          totalBookings: data.count,
          startDate: $scope.startDate,
          endDate: $scope.endDate
        };
      }
      
      // Verify email exists before sending
      if (!emailData.email) {
        ToastService.error("No email address found for this user");
        return;
      }
      
      // Send the formatted data to the service
      ChartService.sendCongratulationMail(emailData)
        .then((response) => {
          // Notify success with toast
          ToastService.success(`Congratulation mail sent successfully`);
        })
        .catch((err) => {
          // Notify error with toast
          ToastService.error(`Error sending the congratulation mail: ${err.data?.message || err.message || err}`);
        });
    }
    // Reset analytics with proper date initialization
    $scope.resetAnalytics = () => {
      $scope.startDate = new Date(new Date().setDate(new Date().getDate() - 7));
      $scope.endDate = new Date();
      fetchChartsData();
    }
  });

