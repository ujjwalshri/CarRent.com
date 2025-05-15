angular
  .module("myApp")
  .controller(
    "analyticsCtrl",
    function ($scope, $q, ToastService, ChartService, AdminAnalyticsService, City, $timeout) {
      // Set toggle states for collapsible panels (initially expand the first one)
      $scope.toggleTopSellers = true;
      $scope.toggleTopBuyers = false;

      // Analytics data variables
      $scope.userEngagementPercentage;
      $scope.userGrowthFilter = "city";
      $scope.topSellersWithMostEarnings;
      $scope.top10BuyersWithMostBookings;
      $scope.numberOfCustomersWithReviews;
      $scope.numberOfSatisfiedCustomers;
      $scope.isLoading = false;
      $scope.newUsers;
      
      // Geographical data for mapping
      $scope.indianCitiesAndLongitudeAndLatitudeMap =
        City.getIndianCitiesAndLongitudeMap();

      /**
       * Initialize the analytics controller
       * Sets up initial date range and loads initial data
       */
      $scope.init = () => {
        // Initialize date range with proper Date objects
        $scope.startDate = new Date(
          new Date().setDate(new Date().getDate() - 7)
        );
        $scope.endDate = new Date();

        // Initialize active tab
      $scope.activeTab = "Overview";
      };

      /**
       * Handle tab changes
       */
      $scope.onTabSelect = function (tabName) {
        $scope.activeTab = tabName;

        switch (tabName) {
          case "Overview":
            loadOverviewData();
            break;
          case "Top Performers":
            loadTopPerformersData();
            break;
          case "Charts":
            loadChartsData();
            break;
          case "Maps":
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

        if (
          $scope.endDate.setHours(0, 0, 0, 0) > new Date().setHours(0, 0, 0, 0)
        ) {
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
      window.initMap = function (heatmapData, htmlElementId) {
        // Create a new Google Map centered on India
        var map = new google.maps.Map(document.getElementById(htmlElementId), {
          center: { lat: 20.5937, lng: 78.9629 }, // Indian map center
          zoom: 5,
          mapTypeId: "satellite",
        });

        // Create and configure the heatmap layer
        var heatmap = new google.maps.visualization.HeatmapLayer({
          data: heatmapData,
        });

        // Add the heatmap layer to the map
        heatmap.setMap(map);

        // Add city name labels to the map
        Object.keys($scope.indianCitiesAndLongitudeAndLatitudeMap).forEach(
          function (city) {
            var coord = $scope.indianCitiesAndLongitudeAndLatitudeMap[city];

            // Create a div element for the city label
            var labelDiv = document.createElement("div");
            labelDiv.style.position = "absolute";
            labelDiv.style.fontSize = "8px";
            labelDiv.style.fontWeight = "bold";
            labelDiv.style.color = "white";
            labelDiv.innerText = city;

            // Create an overlay to position the label on the map
            var labelOverlay = new google.maps.OverlayView();

            // Define what happens when the overlay is added to the map
            labelOverlay.onAdd = function () {
              var layer = this.getPanes().overlayLayer;
              layer.appendChild(labelDiv);
            };

            // Define how to position the label based on map projection
            labelOverlay.draw = function () {
              var projection = this.getProjection();
              var position = projection.fromLatLngToDivPixel(
                new google.maps.LatLng(coord.lat, coord.lng)
              );
              labelDiv.style.left = position.x + "px";
              labelDiv.style.top = position.y + "px";
            };

            // Add the overlay to the map
            labelOverlay.setMap(map);
          }
        );
      };

      /**
       * Load Overview tab data
       */
      function loadOverviewData() {
        if (!validateDateRange()) return;

        $scope.isLoading = true;
        const params = {
          startDate: formatDateForAPI($scope.startDate),
          endDate: formatDateForAPI($scope.endDate),
        };

        $q.all([
          AdminAnalyticsService.getGeneralAnalyticsForAdmin(params),
          AdminAnalyticsService.getOverviewStatsForAdmin(params),
          AdminAnalyticsService.getCustomerSatisfactionScoreForAdmin(params),
          AdminAnalyticsService.getNewUsers(params),
        ])
          .then(
            ([
              generalAnalytics,
              overviewStats,
              customerSatisfactionScore,
              newUsers,
            ]) => {
              $scope.newUsers = newUsers[0]?.totalNewUsers || 0;
              $scope.userEngagementPercentage =
                generalAnalytics.engagementPercentage?.toFixed(2) || 0;
              $scope.blockedUsers =
                generalAnalytics.totalNumberOfBlockedUsers?.toFixed(2) || 0;
              $scope.ongoingBookings = generalAnalytics.ongoingBookings;
              $scope.biddingConversionRate =
                overviewStats.biddingConversionRate[0].conversionRate?.toFixed(
                  2
                );
            }
          )
          .catch((err) => {
            console.error("Error loading overview data:", err);
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
          endDate: formatDateForAPI($scope.endDate),
        };

        AdminAnalyticsService.getTopPerformersForAdmin(params)
          .then((response) => {
            // Initialize arrays even if no data is returned
            $scope.topSellersWithMostEarnings = response.topSellers
              ? response.topSellers
              : [];
            $scope.topBuyersWithMostBookings = response.topBuyers
              ? response.topBuyers
              : [];
          })
          .catch((err) => {
            console.error("Error loading top performers data:", err);
            ToastService.error("Failed to load top performers data");
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
          endDate: formatDateForAPI($scope.endDate),
        };

        $q.all([
          AdminAnalyticsService.getCarDescriptionStats(params),
          AdminAnalyticsService.getTop10PopularCarModels(params),
          AdminAnalyticsService.getTop3MostReviewedCars(params),
          AdminAnalyticsService.getTop3OwnersWithMostCars(params),
          AdminAnalyticsService.getUserGrowthStats(params),
          AdminAnalyticsService.getHighestEarningCities(params),
          AdminAnalyticsService.getTop3CompaniesWithMostNegativeReviews(params),
          AdminAnalyticsService.getTopSellersWithMostNegativeReviews(params), 
          AdminAnalyticsService.getCategoryWiseBookings(params),
        ])
          .then(
            ([
              carDescription,
              popularCarModels,
              mostReviewedCars,
              topOwners,
              userGrowth,
              highestEarningCities,
              top3CompaniesWithMostNegativeReviews,
              topSellersWithMostNegativeReviews,
              categoryWiseBookings,
            ]) => {

              console.log(categoryWiseBookings);

              // create a bar chart
              ChartService.createBarChart(
                "bar",
                top3CompaniesWithMostNegativeReviews.map(
                  (company) => company._id
                ),
                top3CompaniesWithMostNegativeReviews.map(
                  (company) => company.totalNegativeReviews
                ),
                "Top 3 Companies with Most Negative Reviews",
                "Top 3 Companies with Most Negative Reviews(rating less than 3)",
                "top3CompaniesWithMostNegativeReviews"
              );

              ChartService.createLineChart( "userGrowth",
               
                {
                 labels: userGrowth.map((user) => user._id),
                data: userGrowth.map((user) => user.count),
               title: "User Growth",
                label: "User Growth"
                }
              );
              
              

              ChartService.createPieChart(
                categoryWiseBookings.map((category) => category._id),
                categoryWiseBookings.map((category) => category.totalBookings),
                "Category Wise Number of Biddings ",
                "categoryWiseBookings"
              )

              // Create Top Highest Earning Cities chart
              if (highestEarningCities) {
                var cities = highestEarningCities.map(city => city._id);
                var earnings = highestEarningCities.map(city => city.totalEarnings);
                
                ChartService.createBarChart(
                  "bar",
                  cities,
                  earnings,
                  'Revenue (₹)',
                  "Top Highest Earning Cities",
                  "topHighestEarningCities"
                );
              }

             
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
                "Category Wise Number of Cars",
                "carDescription"
              );

              ChartService.createBarChart(
                "bar",
                mostReviewedCars.map((car) => car._id),
                mostReviewedCars.map((car) => car.count),
                "Number of Reviews",
                "Top 3 cars with most no. of good rating (rating more than 2)",
                "top3MostReviewedCars"
              );

              ChartService.createBarChart(
                "bar",
                topOwners.map((owner) => owner._id),
                topOwners.map((owner) => owner.count),
                "Number of Cars Added",
                "Top 3 Sellers with most cars added",
                "top3Sellers"
              );
              ChartService.createBarChart(
                "bar",
                topSellersWithMostNegativeReviews.map((seller) => seller._id),
                topSellersWithMostNegativeReviews.map(
                  (seller) => seller.totalNegativeReviews
                ),
                "Number of Negative Reviews",
                "Top 5 Sellers with most negative reviews (rating less than 3)",
                "topSellersWithMostNegativeReviews"
              )
            }
          )
          .catch((err) => {
            console.error("Error loading charts data:", err);
            ToastService.error("Failed to load charts data");
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
          endDate: formatDateForAPI($scope.endDate),
        };

        $q.all([
          AdminAnalyticsService.getBiddingsPerCity(params),
        ])
          .then(([biddingsPerCity]) => {
            // Prepare heatmap data for biddings
            let biddingHeatmapData = biddingsPerCity
              .map((city) => {
                if ($scope.indianCitiesAndLongitudeAndLatitudeMap[city._id]) {
                  return {
                    location: new google.maps.LatLng(
                      $scope.indianCitiesAndLongitudeAndLatitudeMap[
                        city._id
                      ].lat,
                      $scope.indianCitiesAndLongitudeAndLatitudeMap[
                        city._id
                      ].lng
                    ),
                    weight: city.count,
                  };
                }
              })
              .filter(Boolean);

            window.initMap(biddingHeatmapData, "cityWiseBookings");
          })
          .catch((err) => {
            console.error("Error loading maps data:", err);
            ToastService.error("Failed to load maps data");
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

        switch ($scope.activeTab) {
          case "Overview":
            loadOverviewData();
            break;
          case "Top Performers":
            loadTopPerformersData();
            break;
          case "Charts":
            loadChartsData();
            break;
          case "Maps":
            loadMapsData();
            break;
        }
      };

      /**
       * Reset analytics with proper date initialization
       */
      $scope.resetAnalytics = () => {
        $scope.startDate = new Date(
          new Date().setDate(new Date().getDate() - 7)
        );
        $scope.endDate = new Date();
        $scope.filter();
      };

      /**
       * Send congratulation email to top performing users
       * @param {Object} data - User data for email recipient
       */
      $scope.sendCongratulationMail = (data) => {
        let emailData = {};
        // admin clicked on the send congratulations button of the seller
        if (data.totalEarnings !== undefined) {
          emailData = {
            email: data.ownerEmail,
            amount: data.totalEarnings + (data.totalFine || 0),
            startDate: $scope.startDate,
            endDate: $scope.endDate,
          };
        } else if (data.count !== undefined) { // admin clicked on the send congratulations button of the buyer
          emailData = {
            email: data.buyerEmail,
            totalBookings: data.count,
            startDate: $scope.startDate,
            endDate: $scope.endDate,
          };
        }
         // calling admin analytics service to send the email
        AdminAnalyticsService.sendCongratulationMail(emailData)
          .then(() => {
            ToastService.success(`Congratulation mail sent successfully`);
          })
          .catch((err) => {
            ToastService.error(
              `Error sending the congratulation mail: ${
                err.data?.message || err.message || err
              }`
            );
          });
      };
    }
  );
