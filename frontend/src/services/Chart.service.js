angular.module('myApp').service('ChartService', function($http, $q, ApiService) {
    const BASE_URL = '/api/seller/analytics';

    /*
    function to create a pie chart for the given data
    @params labels, data, label, htmlElementId
    @returns creates pie chart
    */
  this.createPieChart = (labels, data, label, htmlElementId) => {
    // Store chart instances in a map to manage multiple charts
    if (!this.chartInstances) {
        this.chartInstances = {};
    }

    // Check if a chart already exists for the given element ID and destroy it
    if (this.chartInstances[htmlElementId]) {
        this.chartInstances[htmlElementId].destroy();
    }

    var chartConfig = {
        type: "pie",
        data: {
            labels: labels,
            datasets: [
                {
                    backgroundColor: ["#FF6B6B", "#1E90FF", "#FFD166", "#06D6A0", "#8338EC"],
                    borderColor: "#ffffff",
                    borderWidth: 2,
                    data: data,
                },
            ],
        },
        options: {
            title: {
                display: true,
                text: label,
                fontSize: 16,
                fontColor: "#333"
            },
            legend: {
                position: "bottom",
                labels: { fontColor: "#555", fontSize: 14 }
            },
        }
    };
    var ctx = document.getElementById(htmlElementId).getContext('2d');
    // Create a new chart and store its instance
    this.chartInstances[htmlElementId] = new Chart(ctx, chartConfig);
};




/*
function to createABarChart for the given data
@params type, labels, data, label, text, htmlElementId
@returns creates bar chart
*/
this.createBarChart = (type, labels, data, label, text, htmlElementId) => {
  console.log(data, htmlElementId, labels);
  // Store chart instances in a map to manage multiple charts
  if (!this.chartInstances) {
      this.chartInstances = {};
  }

  // Check if a chart already exists for the given element ID and destroy it
  if (this.chartInstances[htmlElementId]) {
      this.chartInstances[htmlElementId].destroy();
  }

  // Check if this is the earnings chart
  const isEarningsChart = htmlElementId === 'topHighestEarningCities';

  var chartConfig = {
      type: type,
      data: {
          labels: labels,
          datasets: [
              {
                  label: label,
                  backgroundColor: [
                      'rgba(255, 107, 107, 0.7)', // Red
                      'rgba(30, 144, 255, 0.7)', // Blue
                      'rgba(255, 209, 102, 0.7)', // Yellow
                      'rgba(6, 214, 160, 0.7)',  // Green
                      'rgba(131, 56, 236, 0.7)'  // Purple
                  ],
                  borderColor: [
                      'rgba(255, 107, 107, 1)',
                      'rgba(30, 144, 255, 1)',
                      'rgba(255, 209, 102, 1)',
                      'rgba(6, 214, 160, 1)',
                      'rgba(131, 56, 236, 1)'
                  ],
                  borderWidth: 1.5,
                  data: data,
              },
          ],
      },
      options: {
          title: {
              display: true,
              text: text,
              fontSize: 16,
              fontColor: "#333"
          },
          legend: {
              position: "top",
              labels: { fontColor: "#555", fontSize: 14 }
          },
          scales: {
              yAxes: [
                  {
                      ticks: {
                          beginAtZero: true,
                          fontColor: "#555",
                          fontSize: 14,
                          callback: function(value) {
                              if (isEarningsChart) {
                                  return '$' + value.toLocaleString('en-US');
                              }
                              return value;
                          }
                      },
                      gridLines: { color: "rgba(200, 200, 200, 0.3)" }
                  },
              ],
              xAxes: [
                  {
                      ticks: { fontColor: "#555", fontSize: 14 },
                      gridLines: { color: "rgba(200, 200, 200, 0.3)" }
                  },
              ],
          },
          tooltips: {
              callbacks: {
                  label: function(tooltipItem, chartData) {
                      if (isEarningsChart) {
                          return new Intl.NumberFormat('en-US', { 
                              style: 'currency', 
                              currency: 'USD' 
                          }).format(tooltipItem.value);
                      }
                      return tooltipItem.value;
                  }
              }
          }
      }
  };

  var ctx = document.getElementById(htmlElementId).getContext("2d");
  // Create a new chart and store its instance
  this.chartInstances[htmlElementId] = new Chart(ctx, chartConfig);
};
    /*
    function to get the car description
    @params params
    @returns car description
    */
    this.getCarDescriptionForSeller = async (params) => {
      console.log("params", params);
      let deffered = $q.defer();
      $http.get(`${ApiService.baseURL}/api/seller/carDescription`, {params:params, withCredentials:true})
      .then((response)=>{
        deffered.resolve(response.data);
      })
      .catch((error)=>{
        deffered.reject(error);
      });
      return deffered.promise;
    }
    /*
    function to get the top 3 most popular cars
    @params params
    @returns top 3 most popular cars
    */
    this.getTop3MostPopularCars = async (params) => {
      console.log("params", params);
      let deffered = $q.defer();
      $http.get(`${ApiService.baseURL}/api/seller/top3MostPopularCars`, {params:params, withCredentials:true})
      .then((response)=>{
        deffered.resolve(response.data);
      })
      .catch((error)=>{
        deffered.reject(error);
      });
      return deffered.promise;
    }
    /*
    function to get the number of bookings per car city for seller
    @params params
    @returns number of bookings per car city for seller
    */
    this.getNumberOfBookingsPerCarCityForSeller = async (params) => {
      console.log("params", params);
      let deffered = $q.defer();
      $http.get(`${ApiService.baseURL}/api/seller/numberOfBiddingsPerCarLocation`, {params:params, withCredentials:true})
      .then((response)=>{
        deffered.resolve(response.data);
      })
      .catch((error)=>{
        deffered.reject(error);
      });
      return deffered.promise;
    }
    /*
    function to get the total cars added by seller
    @params params
    @returns total cars added by seller
    */
    this.getTotalCarsAddedBySeller = async (params) => {
      console.log("params", params);
      let deffered = $q.defer();
      $http.get(`${ApiService.baseURL}/api/seller/getTotalCarsAdded`, {params:params, withCredentials:true})
      .then((response)=>{
        deffered.resolve(response.data);
      })
      .catch((error)=>{
        deffered.reject(error);
      });
      return deffered.promise;
    }
    /*
    function to get the bids per location type for seller
    @params params
    @returns bids per location type for seller
    */
    this.getBidsPerLocationTypeForSeller = async (params) => {
      let deffered = $q.defer();
      $http.get(`${ApiService.baseURL}/api/seller/getBidsPerLocationType`, {params:params, withCredentials:true})
      .then((response)=>{
        deffered.resolve(response.data);
      })
      .catch((error)=>{
        deffered.reject(error);
      });
      return deffered.promise;

    }
    /*
    function to get the total booking revenue for seller
    @params params
    @returns total booking revenue for seller
    */
    this.getTotalBookingRevenueForSeller = async (params) => {
      let deffered = $q.defer();
      $http.get(`${ApiService.baseURL}/api/seller/getTotalBookingRevenue`, {params:params, withCredentials:true})
      .then((response)=>{
        deffered.resolve(response.data);
      })
      .catch((error)=>{
        deffered.reject(error);
      });
      return deffered.promise;
    }
    /*
    function to get the on going bookings for seller
    @params params
    @returns on going bookings for seller
    */
    this.onGoingBookingsForSeller = async (params) => {
      let deffered = $q.defer();
      $http.get(`${ApiService.baseURL}/api/seller/onGoingBookings`, {params:params, withCredentials:true})
      .then((response)=>{
        deffered.resolve(response.data);
      })
      .catch((error)=>{
        deffered.reject(error);
      });
      return deffered.promise;
    }
    /*
    function to get the my bids in last 7 days vs other seller avg bids for seller
    @params params
    @returns my bids in last 7 days vs other seller avg bids for seller
    */
    this.myBidsAndOtherSellersAvgBidsForSeller = async (params) => {
      let deffered = $q.defer();
      $http.get(`${ApiService.baseURL}/api/seller/myBidsAndOtherSellersAvgBids`, {params:params, withCredentials:true})
      .then((response)=>{
        deffered.resolve(response.data);
      })
      .catch((error)=>{
        deffered.reject(error);
      });
      return deffered.promise;
    }
    /*
    function to get the car wise bookings for seller
    @params params
    @returns car wise bookings for seller
    */
    this.getcarWiseBookingsForSeller = async (params) => {
      let deffered = $q.defer();
      $http.get(`${ApiService.baseURL}/api/seller/getcarWiseBookings`, {params:params, withCredentials:true})
      .then((response)=>{
        deffered.resolve(response.data);
      })
      .catch((error)=>{
        deffered.reject(error);
      });
      return deffered.promise;
    }
    /*
    function to get the month wise bookings for seller
    @params params
    @returns month wise bookings for seller
    */
    this.getMonthWiseBookingsForSeller = async () => {
      let deffered = $q.defer();
      $http.get(`${ApiService.baseURL}/api/seller/getMonthWiseBookings`, { withCredentials:true})
      .then((response)=>{
        deffered.resolve(response.data);
      })
      .catch((error)=>{
        deffered.reject(error);
      });
      return deffered.promise;
    }
    /*
    function to get the average rental duration for seller
    @params params
    @returns average rental duration for seller
    */
    this.getAverageRentalDurationForSeller = async (params) => {
      console.log(params);
      let deffered = $q.defer();
      $http.get(`${ApiService.baseURL}/api/seller/getAverageRentalDuration`, {params:params, withCredentials:true})
      .then((response)=>{
        deffered.resolve(response.data);
      })
      .catch((error)=>{
        deffered.reject(error);
      });
      return deffered.promise;
    }
    /*
    function to get the repeating customer percetage for a user 
    @params params
    @returns repeating customer percentage
    */

    this.getRepeatingCustomersPercentageForSeller = async(params)=>{
      let deffered = $q.defer();
      $http.get(`${ApiService.baseURL}/api/seller/getRepeatingCustomersPercentage`, {params:params, withCredentials:true})
      .then((response)=>{
        deffered.resolve(response.data);
      })
      .catch((error)=>{
        deffered.reject(error);
      });
      return deffered.promise;
    }

    

    /*
    function to get the suv vs sedan for admin
    @params params
    @returns suv vs sedan for admin
    */
    this.getChartsData = async (params) => {
      let deffered = $q.defer();
      $http.get(`${ApiService.baseURL}/api/admin/charts`, {params:params, withCredentials:true})
      .then((response)=>{
        deffered.resolve(response.data);
      })
      .catch((error)=>{
        deffered.reject(error);
      });
      return deffered.promise;
    }

    
    /*
    function to get the average booking duration for admin
    @params params
    @returns average booking duration for admin
    */
    this.getGeneralAnalyticsForAdmin = async (params) => {
      let deffered = $q.defer();
      $http.get(`${ApiService.baseURL}/api/admin/getGeneralAnalytics`, {params:params, withCredentials:true})
      .then((response)=>{
        deffered.resolve(response.data);
      })
      .catch((error)=>{
        deffered.reject(error);
      });
      return deffered.promise;
    }
    /*
    function to get the bidding conversion rate for admin
    @params params
    @returns bidding conversion rate for admin
    */
    this.getOverviewStatsForAdmin = async (params) => {
      let deffered = $q.defer();
      $http.get(`${ApiService.baseURL}/api/admin/getOverviewStats`, {params:params, withCredentials:true})
      .then((response)=>{
        deffered.resolve(response.data);
      })
      .catch((error)=>{
        deffered.reject(error);
      });
      return deffered.promise;
    }
    

    /*
    function to get the number of owners per city for admin
    @params params
    @returns number of owners per city for admin
    */
    this.numberOfUsersPerCityForAdmin = async () => {
      let deffered = $q.defer();
      $http.get(`${ApiService.baseURL}/api/admin/numberOfUsersPerCity`, { withCredentials:true})
      .then((response)=>{
        deffered.resolve(response.data);
      })
      .catch((error)=>{
        deffered.reject(error);
      });
      return deffered.promise;
    }

    this.topHighestEarningCitiesForAdmin = async (params) => {
      let deffered = $q.defer();
      $http.get(`${ApiService.baseURL}/api/admin/topHighestEarningCities`, {params:params, withCredentials:true})
      .then((response)=>{
        deffered.resolve(response.data);
      })
      .catch((error)=>{
        deffered.reject(error);
      });
      return deffered.promise;
    }
    this.getTopPerformersForAdmin = async (params) => {
      let deffered = $q.defer();
      $http.get(`${ApiService.baseURL}/api/admin/topPerformers`, {params:params, withCredentials:true})
      .then((response)=>{
        deffered.resolve(response.data);
      })
      .catch((error)=>{
        deffered.reject(error);
      });
      return deffered.promise;
    }

    this.top3CarsWithMostEarning = async (params) => {
      let deffered = $q.defer();
      $http.get(`${ApiService.baseURL}/api/seller/top3CarsWithMostEarning`, {params:params, withCredentials:true})
      .then((response)=>{
        deffered.resolve(response.data);
      })
      .catch((error)=>{
        deffered.reject(error);
      });
      return deffered.promise;
    }
    this.top3CostumersWithMostBookings = async (params) => {
      let deffered = $q.defer();
      $http.get(`${ApiService.baseURL}/api/seller/top3CostumersWithMostBookings`, {params:params, withCredentials:true})
      .then((response)=>{
        deffered.resolve(response.data);
      })
      .catch((error)=>{
        deffered.reject(error);
      });
      return deffered.promise;
    }
    this.peakBiddingHours = async (params) => {
      console.log(params);
      let deffered = $q.defer();
      $http.get(`${ApiService.baseURL}/api/seller/peakBiddingHours`, {params:params, withCredentials:true})
      .then((response)=>{
        deffered.resolve(response.data);
      })
      .catch((error)=>{
        deffered.reject(error);
      });
      return deffered.promise;
    }
    this.getNumberOfBookingsForSeller = async (params) => {
      let deffered = $q.defer();
      $http.get(`${ApiService.baseURL}/api/seller/numberOfBookings`, {params:params, withCredentials:true})
      .then((response)=>{
        deffered.resolve(response.data);
      })
      .catch((error)=>{
        deffered.reject(error);
      });
      return deffered.promise;
    }
    this.getCarWiseNegativeReviews = async (params) => {
      let deffered = $q.defer();
      $http.get(`${ApiService.baseURL}/api/seller/getCarWiseNegativeReviews`, {params:params, withCredentials:true})
      .then((response)=>{
        deffered.resolve(response.data);
      })
      .catch((error)=>{
        deffered.reject(error);
      });
      return deffered.promise;
    }
    this.sendCongratulationMail = async (data) => {
      console.log(data);
      let deffered = $q.defer();
      $http.post(`${ApiService.baseURL}/api/admin/sendCongratulationMail`, data, { withCredentials:true})
      .then((response)=>{
        deffered.resolve(response.data);
      })
      .catch((error)=>{
        deffered.reject(error);
      });
      return deffered.promise;
    }
    this.getNegativeReviewsPercentage = async (params) => {
      let deffered = $q.defer();
      $http.get(`${ApiService.baseURL}/api/seller/getNegativeReviewsPercentage`, {params:params, withCredentials:true})
      .then((response)=>{
        deffered.resolve(response.data);
      })
      .catch((error)=>{
        deffered.reject(error);
      });
      return deffered.promise;
    }

    /**
     * Creates a line chart with customizable options
     * @param {string} canvasId - The ID of the canvas element
     * @param {Object} chartData - The data configuration object
     * @param {string[]} chartData.labels - Array of labels for the x-axis
     * @param {number[]} chartData.data - Array of data points
     * @param {string} chartData.title - Chart title
     * @param {Object} [chartData.colors] - Optional custom colors
     * @param {string} [chartData.label] - Dataset label
     * @returns {Chart} Chart instance
     */
    this.createLineChart = function(canvasId, chartData) {
        // Set default colors if not provided
        const colors = chartData.colors || {
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(54, 162, 235, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(54, 162, 235, 1)'
            ]
        };

        // Get canvas context
        var ctx = document.getElementById(canvasId).getContext("2d");

        // Create and return chart
        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: chartData.label || 'Data',
                    data: chartData.data,
                    backgroundColor: colors.backgroundColor,
                    borderColor: colors.borderColor,
                    borderWidth: 1
                }]
            },
            options: {
                title: {
                    display: true,
                    text: chartData.title
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
    };

  
    // Individual analytics endpoints
    this.getTotalRevenue = (params) => {
        return $http.get(`${ApiService.baseURL}/api/seller/analytics/revenue`, { params, withCredentials: true })
            .then(response => response.data)
            .catch(error => {
                console.error('Error fetching revenue data:', error);
                throw error;
            });
    };

    this.getCarDescription = (params) => {
        return $http.get(`${ApiService.baseURL}/api/seller/analytics/car-description`, { params, withCredentials: true })
            .then(response => response.data)
            .catch(error => {
                console.error('Error fetching car description data:', error);
                throw error;
            });
    };

    this.getPopularCars = (params) => {
        return $http.get(`${ApiService.baseURL}/api/seller/analytics/popular-cars`, { params, withCredentials: true })
            .then(response => response.data)
            .catch(error => {
                console.error('Error fetching popular cars data:', error);
                throw error;
            });
    };

    this.getCarWiseBookings = (params) => {
        return $http.get(`${ApiService.baseURL}/api/seller/analytics/car-wise-bookings`, { params, withCredentials: true })
            .then(response => response.data)
            .catch(error => {
                console.error('Error fetching car-wise bookings data:', error);
                throw error;
            });
    };

    this.getNegativeReviews = (params) => {
        return $http.get(`${ApiService.baseURL}/api/seller/analytics/negative-reviews`, { params, withCredentials: true })
            .then(response => response.data)
            .catch(error => {
                console.error('Error fetching negative reviews data:', error);
                throw error;
            });
    };

    this.getTopEarningCars = (params) => {
        return $http.get(`${ApiService.baseURL}/api/seller/analytics/top-earning-cars`, { params, withCredentials: true })
            .then(response => response.data)
            .catch(error => {
                console.error('Error fetching top earning cars data:', error);
                throw error;
            });
    };

    this.getPeakHours = (params) => {
        return $http.get(`${ApiService.baseURL}/api/seller/analytics/peak-hours`, { params, withCredentials: true })
            .then(response => response.data)
            .catch(error => {
                console.error('Error fetching peak hours data:', error);
                throw error;
            });
    };

    this.getMonthlyBookings = (params) => {
        return $http.get(`${ApiService.baseURL}/api/seller/analytics/monthly-bookings`, { params, withCredentials: true })
            .then(response => response.data)
            .catch(error => {
                console.error('Error fetching monthly bookings data:', error);
                throw error;
            });
    };

    this.getTopCustomers = (params) => {
        return $http.get(`${ApiService.baseURL}/api/seller/analytics/top-customers`, { params, withCredentials: true })
            .then(response => response.data)
            .catch(error => {
                console.error('Error fetching top customers data:', error);
                throw error;
            });
    };

    this.getAverageRentalDuration = (params) => {
        return $http.get(`${ApiService.baseURL}/api/seller/analytics/average-rental-duration`, { params, withCredentials: true })
            .then(response => response.data)
            .catch(error => {
                console.error('Error fetching average rental duration data:', error);
                throw error;
            });
    };

    this.getRepeatingCustomersPercentage = (params) => {
        return $http.get(`${ApiService.baseURL}/api/seller/analytics/repeating-customers`, { params, withCredentials: true })
            .then(response => response.data)
            .catch(error => {
                console.error('Error fetching repeating customers data:', error);
                throw error;
            });
    };

    this.getCityWiseBookings = (params) => {
        return $http.get(`${ApiService.baseURL}/api/seller/analytics/city-wise-bookings`, { params, withCredentials: true })
            .then(response => response.data)
            .catch(error => {
                console.error('Error fetching city-wise bookings data:', error);
                throw error;
            });
    };

    /*
    function to get bidding comparison data
    @params params
    @returns bidding comparison data
    */
    this.getBiddingComparison = (params) => {
        let deferred = $q.defer();
        $http.get(`${ApiService.baseURL}/api/seller/analytics/bidding-comparison`, { params: params, withCredentials: true })
            .then((response) => {
                deferred.resolve(response.data);
            })
            .catch((error) => {
                deferred.reject(error);
            });
        return deferred.promise;
    };

    /*
    function to get earning comparison data
    @params params
    @returns earning comparison data
    */
    this.getEarningComparison = (params) => {
        let deferred = $q.defer();
        $http.get(`${ApiService.baseURL}/api/seller/analytics/earning-comparison`, { params: params, withCredentials: true })
            .then((response) => {
                deferred.resolve(response.data);
            })
            .catch((error) => {
                deferred.reject(error);
            });
        return deferred.promise;
    };
})