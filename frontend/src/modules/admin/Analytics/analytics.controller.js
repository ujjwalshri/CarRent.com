angular
  .module("myApp")
  .controller("analyticsCtrl", function ($scope, $q, ToastService, ChartService, City, $timeout) {
    // Analytics data variables
    $scope.userEngagementPercentage;
    $scope.userGrowthFilter = "city";
    $scope.topSellersWithMostEarnings;
    $scope.top10BuyersWithMostBookings;

    $scope.numberOfCustomersWithReviews;
    $scope.numberOfSatisfiedCustomers;
    $scope.isLoading = false;
    $scope.newUsers;
    // Initialize active tab
    $scope.activeTab = 'Overview';
    // Geographical data for mapping
    $scope.indianCitiesAndLongitudeAndLatitudeMap = City.getIndianCitiesAndLongitudeMap();
    
    /**
     * Initialize the analytics controller
     * Sets up initial date range and loads initial data
     */
    $scope.init = () => {
      // Initialize date range with proper Date objects
      $scope.startDate = new Date(new Date().setDate(new Date().getDate() - 7));
      $scope.endDate = new Date();
    };

    /**
     * Handle tab changes
     */
    $scope.onTabSelect = function(tabName) {
      $scope.activeTab = tabName;
      
      switch(tabName) {
        case 'Overview':
          loadOverviewData();
          break;
        case 'Top Performers':
          loadTopPerformersData();
          break;
        case 'Charts':
          loadChartsData();
          break;
        case 'Maps':
          loadMapsData();
          break;
      }
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
     * Load Overview tab data
     */
    function loadOverviewData() {
      if (!validateDateRange()) return;
      
      $scope.isLoading = true;
      const params = {
        startDate: formatDateForAPI($scope.startDate),
        endDate: formatDateForAPI($scope.endDate)
      };

      $q.all([
        ChartService.getGeneralAnalyticsForAdmin(params),
        ChartService.getOverviewStatsForAdmin(params),
        ChartService.getCustomerSatisfactionScoreForAdmin(params),
        ChartService.getNewUsers(params)
      ])
      .then(([generalAnalytics, overviewStats, customerSatisfactionScore, newUsers]) => {
        console.log(customerSatisfactionScore);
        $scope.newUsers = newUsers[0]?.totalNewUsers || 0;
        $scope.userEngagementPercentage = generalAnalytics.engagementPercentage?.toFixed(2) || 0;
        $scope.blockedUsers = generalAnalytics.totalNumberOfBlockedUsers?.toFixed(2) || 0;
        $scope.ongoingBookings = generalAnalytics.ongoingBookings;
        $scope.biddingConversionRate = overviewStats.biddingConversionRate[0].conversionRate?.toFixed(2);
        
      })
      .catch(err => {
        console.error('Error loading overview data:', err);
      })
      .finally(() => {
        $scope.isLoading = false;
        $timeout();
      });
    }

    /**
     * Load Top Performers tab data
     */
    function loadTopPerformersData() {
      if (!validateDateRange()) return;
      
      $scope.isLoading = true;
      const params = {
        startDate: formatDateForAPI($scope.startDate),
        endDate: formatDateForAPI($scope.endDate)
      };

      ChartService.getTopPerformersForAdmin(params)
        .then(response => {
          // Initialize arrays even if no data is returned
          $scope.topSellersWithMostEarnings = response.topSellers ? response.topSellers : [];
          $scope.topBuyersWithMostBookings = response.topBuyers ? response.topBuyers : [];
          
        })
        .catch(err => {
          console.error('Error loading top performers data:', err);
          ToastService.error('Failed to load top performers data');
          // Initialize empty arrays on error
          $scope.topSellersWithMostEarnings = [];
          $scope.topBuyersWithMostBookings = [];
        })
        .finally(() => {
          $scope.isLoading = false;
          $timeout();
        });
    }

    /**
     * Load Charts tab data
     */
    function loadChartsData() {
      if (!validateDateRange()) return;
      
      $scope.isLoading = true;
      const params = {
        startDate: formatDateForAPI($scope.startDate),
        endDate: formatDateForAPI($scope.endDate)
      };

      $q.all([
        ChartService.getCarDescriptionStats(params),
        ChartService.getTop10PopularCarModels(params),
        ChartService.getTop3MostReviewedCars(params),
        ChartService.getTop3OwnersWithMostCars(params),
        ChartService.getUserGrowthStats(params),
        ChartService.getHighestEarningCities(params),
        ChartService.numberOfUsersPerCityForAdmin(),
        ChartService.getTop3CompaniesWithMostNegativeReviews(params)
      ])
      .then(([
        carDescription,
        popularCarModels,
        mostReviewedCars,
        topOwners,
        userGrowth,
        highestEarningCities,
        usersPerCity,
        top3CompaniesWithMostNegativeReviews
      ]) => {

        // create a bar chart
        ChartService.createBarChart(
          "bar",
          top3CompaniesWithMostNegativeReviews.map((company) => company._id),
          top3CompaniesWithMostNegativeReviews.map((company) => company.totalNegativeReviews),
          "Top 3 Companies with Most Negative Reviews",
          "Top 3 Companies with Most Negative Reviews",
          "top3CompaniesWithMostNegativeReviews"
        );

        
        // Create charts
        ChartService.createBarChart(
          "line", 
          userGrowth.map((user) => user._id), 
          userGrowth.map((user) => user.count), 
          "User Growth", 
          "User Growth", 
          "userGrowth"
        );

        ChartService.createBarChart(
          "bar",
          usersPerCity.sellers.map((owner) => owner._id),
          usersPerCity.sellers.map((owner) => owner.count), 
          "Number of Owner per city",
          "number of owners per city",
          "ownersPerCity"
        );

        ChartService.createBarChart(
          "bar",
          highestEarningCities.map((city) => city._id),
          highestEarningCities.map((city) => city.totalEarnings),
          "Earnings in USD ($)",
          "Top 5 highest revenue generating cities",
          "topHighestEarningCities"
        );

        ChartService.createBarChart(
          "bar",
          usersPerCity.buyers.map((buyer) => buyer._id),
          usersPerCity.buyers.map((buyer) => buyer.count), 
          "Number of Buyers per city",
          "number of buyers per city",
          "buyersPerCity"
        );

        ChartService.createBarChart(
          "bar",
          popularCarModels.map((car) => car._id),
          popularCarModels.map((car) => car.count), 
          "Number of Biddings",
          "Top 10 most popular car models on the platform",
          "top10Cars"
        );

        ChartService.createBarChart(
          "bar", 
          carDescription.map((car) => car._id),
          carDescription.map((car) => car.count),
          "Number of cars",
          "car category and their type on the platform",
          "carDescription"
        );

        ChartService.createBarChart(
          "bar", 
          mostReviewedCars.map((car) => car._id),
          mostReviewedCars.map((car) => car.count),
          "Number of Reviews",
          "Top 3 most reviewed cars",
          "top5MostReviewedCars"
        );

        ChartService.createBarChart(
          "bar",
          topOwners.map((owner) => owner._id), 
          topOwners.map((owner) => owner.count), 
          "Number of Cars Added", 
          "Top 3 Sellers with most cars added",
          "top3Sellers"
        );
      })
      .catch(err => {
        console.error('Error loading charts data:', err);
        ToastService.error('Failed to load charts data');
      })
      .finally(() => {
        $scope.isLoading = false;
      });
    }

    /**
     * Load Maps tab data
     */
    function loadMapsData() {
      if (!validateDateRange()) return;
      
      $scope.isLoading = true;
      const params = {
        startDate: formatDateForAPI($scope.startDate),
        endDate: formatDateForAPI($scope.endDate)
      };

      $q.all([
        ChartService.numberOfUsersPerCityForAdmin(),
        ChartService.getBiddingsPerCity(params)
      ])
      .then(([usersPerCity, biddingsPerCity]) => {
        // Prepare heatmap data for owners
        let ownerHeatmapData = usersPerCity.sellers.map(item => {
          if ($scope.indianCitiesAndLongitudeAndLatitudeMap[item._id]) {
            return {
              location: new google.maps.LatLng(
                $scope.indianCitiesAndLongitudeAndLatitudeMap[item._id].lat,
                $scope.indianCitiesAndLongitudeAndLatitudeMap[item._id].lng
              ),
              weight: item.count
            };
          }
        }).filter(Boolean);

        // Prepare heatmap data for buyers
        let buyerHeatmapData = usersPerCity.buyers.map(buyer => {
          if ($scope.indianCitiesAndLongitudeAndLatitudeMap[buyer._id]) {
            return {
              location: new google.maps.LatLng(
                $scope.indianCitiesAndLongitudeAndLatitudeMap[buyer._id].lat,
                $scope.indianCitiesAndLongitudeAndLatitudeMap[buyer._id].lng
              ),
              weight: buyer.count
            };
          }
        }).filter(Boolean);

        // Prepare heatmap data for biddings
        let biddingHeatmapData = biddingsPerCity.map(city => {
          if ($scope.indianCitiesAndLongitudeAndLatitudeMap[city._id]) {
            return {
              location: new google.maps.LatLng(
                $scope.indianCitiesAndLongitudeAndLatitudeMap[city._id].lat,
                $scope.indianCitiesAndLongitudeAndLatitudeMap[city._id].lng
              ),
              weight: city.count
            };
          }
        }).filter(Boolean);

          window.initMap(ownerHeatmapData, 'map');
          window.initMap(buyerHeatmapData, 'buyerHeatMap');
          window.initMap(biddingHeatmapData, 'cityWiseBookings');
      })
      .catch(err => {
        console.error('Error loading maps data:', err);
        ToastService.error('Failed to load maps data');
      })
      .finally(() => {
        $scope.isLoading = false;
      });
    }
    
    /**
     * Apply date filter and reload current tab data
     */
    $scope.filter = () => {
      if (!validateDateRange()) return;
      
      switch($scope.activeTab) {
        case 'Overview':
          loadOverviewData();
          break;
        case 'Top Performers':
          loadTopPerformersData();
          break;
        case 'Charts':
          loadChartsData();
          break;
        case 'Maps':
          loadMapsData();
          break;
      }
    }

    /**
     * Reset analytics with proper date initialization
     */
    $scope.resetAnalytics = () => {
      $scope.startDate = new Date(new Date().setDate(new Date().getDate() - 7));
      $scope.endDate = new Date();
      $scope.filter();
    }

    /**
     * Send congratulation email to top performing users
     * @param {Object} data - User data for email recipient
     */
    $scope.sendCongratulationMail = (data) => {
      let emailData = {};
      
      if (data.totalEarnings !== undefined) {
        emailData = {
          email: data.ownerEmail,
          amount: data.totalEarnings + (data.totalFine || 0),
          startDate: $scope.startDate,
          endDate: $scope.endDate
        };
      } else if (data.count !== undefined) {
        emailData = {
          email: data.buyerEmail,
          totalBookings: data.count,
          startDate: $scope.startDate,
          endDate: $scope.endDate
        };
      }
      
      if (!emailData.email) {
        ToastService.error("No email address found for this user");
        return;
      }
      
      ChartService.sendCongratulationMail(emailData)
        .then(() => {
          ToastService.success(`Congratulation mail sent successfully`);
        })
        .catch((err) => {
          ToastService.error(`Error sending the congratulation mail: ${err.data?.message || err.message || err}`);
        });
    }
  });

