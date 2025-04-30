angular.module('myApp').service('ChartService', function($http, $q, ApiService) {

    
  /**
   * function to create a pie chart using the params 
   * @param {*} labels 
   * @param {*} data 
   * @param {*} label 
   * @param {*} htmlElementId 
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

  // Check if this is an earnings-related chart
  const isEarningsChart = htmlElementId === 'topHighestEarningCities' || 
                         htmlElementId === 'top3CarsWithMostEarning' ||
                         text.toLowerCase().includes('earning') ||
                         text.toLowerCase().includes('revenue') ||
                         label.toLowerCase().includes('$') ||
                         label.toLowerCase().includes('earning') ||
                         label.toLowerCase().includes('revenue');

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
                                  return '$' + value.toLocaleString('en-US', {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2
                                  });
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
                              currency: 'USD',
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
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
  
  // Helper function to generate a random color for each line
  getColor = (index) => {
    const colors = [
      'rgba(255, 107, 107, 0.7)', // Red
      'rgba(30, 144, 255, 0.7)', // Blue
      'rgba(255, 209, 102, 0.7)', // Yellow
      'rgba(6, 214, 160, 0.7)',  // Green
      'rgba(131, 56, 236, 0.7)'  // Purple
    ];
    return colors[index % colors.length];
  };
  


    /*
    function to get the car description
    @params params
    @returns car description
    */
    this.getCarDescriptionForSeller = async (params) => {
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
    this.getTop3MostPopularCarsForSeller = async (params) => {
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
    /*
    function to get the customer satisfaction score for admin
    @params params
    @returns customer satisfaction score for admin
    */
    this.getCustomerSatisfactionScoreForAdmin = async (params) => {
      let deffered = $q.defer();
      $http.get(`${ApiService.baseURL}/api/admin/customerSatisfactionScore`, {params:params, withCredentials:true})
      .then((response)=>{
        deffered.resolve(response.data);
      })
      .catch((error)=>{
        deffered.reject(error);
      });
      return deffered.promise;
    }
      
    /**
     * Get Top Highest Earning Cities For Admin
     * Retrieves the top highest earning cities
     * 
     * @param {Object} params - Parameters for filtering the data
     * @returns {Promise} Promise resolving to the top highest earning cities
     */
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
    /**
     * Get Top 3 Costumers With Most Bookings
     * Retrieves the top 3 customers with the most bookings
     * 
     * @param {Object} params - Parameters for filtering the data
     * @returns {Promise} Promise resolving to the top 3 customers with most bookings
     */
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

    

   
    /**
     * Get Number of Bookings For Seller
     * Retrieves the number of bookings for the seller
     * 
     * @param {Object} params - Parameters for filtering the data
     * @returns {Promise} Promise resolving to the number of bookings for the seller
     */
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
    /**
     * Get Car Wise Negative Reviews
     * Retrieves the car-wise negative reviews
     * 
     * @param {Object} params - Parameters for filtering the data
     * @returns {Promise} Promise resolving to the car-wise negative reviews
     */
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
        console.log(canvasId);
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

    /**
     * Creates a line chart showing city-wise review counts over time
     * 
     * @param {Object} rawData - The data containing city review counts
     * @param {string} canvasId - The ID of the canvas element to render the chart on
     * @returns {Chart} The created chart instance
     */
    this.createMultilineChart = function(rawData, canvasId) {
        // Step 1: Extract all unique dates
        const allDates = new Set();
        rawData.forEach(city => {
            city.reviewCounts.forEach(rc => allDates.add(rc.date));
        });
        const sortedDates = Array.from(allDates).sort();
    
        // Step 2: Define colors for the chart
        const colors = ['#e6194b', '#3cb44b', '#4363d8', '#f58231', '#911eb4'];
    
        // Step 3: Prepare datasets for up to 5 cities
        const datasets = rawData
            .filter(city => city._id) // Ignore entries with null _id
            .slice(0, 5) // Ensure only up to 5 cities
            .map((city, index) => {
                const data = sortedDates.map(date => {
                    const match = city.reviewCounts.find(rc => rc.date === date);
                    return match ? match.count : 0;
                });
        
                return {
                    label: city._id,
                    data,
                    fill: false,
                    borderColor: colors[index],
                    backgroundColor: colors[index],
                    tension: 0.3
                };
            });
    
        // Step 4: Store chart instances in a map to manage multiple charts
        if (!this.chartInstances) {
            this.chartInstances = {};
        }
    
        // Step 5: Check if a chart already exists for the given element ID and destroy it
        if (this.chartInstances[canvasId]) {
            this.chartInstances[canvasId].destroy();
        }
    
        // Step 6: Check if the canvas element exists
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.warn(`Canvas element with ID ${canvasId} not found in the DOM`);
            return null;
        }
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.warn(`Could not get 2D context for canvas ${canvasId}`);
            return null;
        }
        
        // Step 7: Create and return the chart
        this.chartInstances[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: sortedDates,
                datasets
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top'
                    },
                    title: {
                        display: true,
                        text: 'Review Counts by City'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Review Count'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    }
                }
            }
        });
        
        return this.chartInstances[canvasId];
    };
  
   /**
    * function to get the total revenue for seller
    * @param {*} params 
    * @returns total revenue for seller
    */
    this.getTotalRevenue = (params) => {
        return $http.get(`${ApiService.baseURL}/api/seller/analytics/revenue`, { params, withCredentials: true })
            .then(response => response.data)
            .catch(error => {
                console.error('Error fetching revenue data:', error);
                throw error;
            });
    };
    /**
     * function to get the total revenue by addons for seller
     * @param {*} params 
     * @returns total revenue by addons for seller
     */
    this.getTotalRevenueByAddons = (params) => {
        return $http.get(`${ApiService.baseURL}/api/seller/analytics/total-revenue-by-addons`, { params, withCredentials: true })
            .then(response => response.data)
            .catch(error => {
                console.error('Error fetching total revenue by addons data:', error);
                throw error;
            });
    };
    /**
     * function to get the car description for seller
     * @param {*} params 
     * @returns car description for seller
     */
    this.getCarDescription = (params) => {
        return $http.get(`${ApiService.baseURL}/api/seller/analytics/car-description`, { params, withCredentials: true })
            .then(response => response.data)
            .catch(error => {
                console.error('Error fetching car description data:', error);
                throw error;
            });
    };

    /**
     * function to get the popular cars for seller
     * @param {*} params 
     * @returns popular cars for seller
     */
    this.getPopularCars = (params) => {
        return $http.get(`${ApiService.baseURL}/api/seller/analytics/popular-cars`, { params, withCredentials: true })
            .then(response => response.data)
            .catch(error => {
                console.error('Error fetching popular cars data:', error);
                throw error;
            });
    };

    /**
     * function to get the car-wise bookings for seller
     * @param {*} params 
     * @returns car-wise bookings for seller
     */
    this.getCarWiseBookings = (params) => {
        return $http.get(`${ApiService.baseURL}/api/seller/analytics/car-wise-bookings`, { params, withCredentials: true })
            .then(response => response.data)
            .catch(error => {
                console.error('Error fetching car-wise bookings data:', error);
                throw error;
            });
    };

    /**
     * function to get the negative reviews for seller
     * @param {*} params 
     * @returns negative reviews for seller
     */
    this.getNegativeReviews = (params) => {
        return $http.get(`${ApiService.baseURL}/api/seller/analytics/negative-reviews`, { params, withCredentials: true })
            .then(response => response.data)
            .catch(error => {
                console.error('Error fetching negative reviews data:', error);
                throw error;
            });
    };

    /**
     * function to get the top earning cars for seller
     * @param {*} params 
     * @returns top earning cars for seller
     */
    this.getTopEarningCars = (params) => {
        return $http.get(`${ApiService.baseURL}/api/seller/analytics/top-earning-cars`, { params, withCredentials: true })
            .then(response => response.data)
            .catch(error => {
                console.error('Error fetching top earning cars data:', error);
                throw error;
            });
    };

    /**
     * function to get the peak hours for seller
     * @param {*} params 
     * @returns peak hours for seller
     */
    this.getPeakHours = (params) => {
        return $http.get(`${ApiService.baseURL}/api/seller/analytics/peak-hours`, { params, withCredentials: true })
            .then(response => response.data)
            .catch(error => {
                console.error('Error fetching peak hours data:', error);
                throw error;
            });
    };

    /**
     * function to get the monthly bookings for seller
     * @param {*} params 
     * @returns monthly bookings for seller
     */
    this.getMonthlyBookings = (params) => {
        return $http.get(`${ApiService.baseURL}/api/seller/analytics/monthly-bookings`, { params, withCredentials: true })
            .then(response => response.data)
            .catch(error => {
                console.error('Error fetching monthly bookings data:', error);
                throw error;
            });
    };

    /**
     * function to get the top customers for seller
     * @param {*} params 
     * @returns top customers for seller
     */
    this.getTopCustomers = (params) => {
        return $http.get(`${ApiService.baseURL}/api/seller/analytics/top-customers`, { params, withCredentials: true })
            .then(response => response.data)
            .catch(error => {
                console.error('Error fetching top customers data:', error);
                throw error;
            });
    };

    /**
     * function to get the average rental duration for seller
     * @param {*} params 
     * @returns average rental duration for seller
     */
    this.getAverageRentalDuration = (params) => {
        return $http.get(`${ApiService.baseURL}/api/seller/analytics/average-rental-duration`, { params, withCredentials: true })
            .then(response => response.data)
            .catch(error => {
                console.error('Error fetching average rental duration data:', error);
                throw error;
            });
    };

    /**
     * function to get the repeating customers percentage for seller
     * @param {*} params 
     * @returns repeating customers percentage for seller
     */
    this.getRepeatingCustomersPercentage = (params) => {
        return $http.get(`${ApiService.baseURL}/api/seller/analytics/repeating-customers`, { params, withCredentials: true })
            .then(response => response.data)
            .catch(error => {
                console.error('Error fetching repeating customers data:', error);
                throw error;
            });
    };

    /**
     * function to get the city-wise bookings for seller
     * @param {*} params 
     * @returns city-wise bookings for seller
     */
    this.getCityWiseBookings = (params) => {
        return $http.get(`${ApiService.baseURL}/api/seller/analytics/city-wise-bookings`, { params, withCredentials: true })
            .then(response => response.data)
            .catch(error => {
                console.error('Error fetching city-wise bookings data:', error);
                throw error;
            });
    };

    /**
     * function to get the bidding comparison data
     * @param {*} params 
     * @returns bidding comparison data
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

    /**
     * function to get the earning comparison data
     * @param {*} params 
     * @returns earning comparison data
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

    /**
     * function to get the city wise negative reviews and the dates of the respective reviews
     * @param {*} params 
     * @returns return a promise with the data
     */
    this.getCityWiseNegativeReview = (params)=>{
        let deferred = $q.defer();
        $http.get(`${ApiService.baseURL}/api/seller/analytics/top-city-most-negative-reviews`, { params: params, withCredentials: true })
            .then((response) => {
                deferred.resolve(response.data);
            })
            .catch((error) => {
                deferred.reject(error);
            });
        return deferred.promise;
    }

    /**
     * function to get the average bid cost per rental
     * @param {*} params 
     * @returns average bid cost per rental
     */
    this.getAverageBidCostPerRental = (params) => {
        const deferred = $q.defer();
        $http.get(`${ApiService.baseURL}/api/seller/analytics/average-bid-cost-per-rental`, { params, withCredentials: true })
            .then(response => {
                deferred.resolve(response.data);
            })
            .catch(error => {
                console.error('Error fetching average cost per rental data:', error);
                deferred.reject(error);
            });
        return deferred.promise;
    };

    /**
     * function to get the average booking payment
     * @param {*} params 
     * @returns average booking payment
     */
    this.getAverageBookingPayment = (params) => {
        const deferred = $q.defer();
        $http.get(`${ApiService.baseURL}/api/seller/analytics/average-booking-payment`, { params, withCredentials: true })
            .then(response => {
                deferred.resolve(response.data);
            })
            .catch(error => {
                console.error('Error fetching average booking payment data:', error);
                deferred.reject(error);
            });
        return deferred.promise;
    };

    /**
     * function to get the selected addons count
     * @param {*} params 
     * @returns selected addons count
     */
    this.getSelectedAddonsCount = (params) => {
        const deferred = $q.defer();
        $http.get(`${ApiService.baseURL}/api/seller/analytics/selected-addons-count`, { params, withCredentials: true })
            .then(response => {
                deferred.resolve(response.data);
            })
            .catch(error => {
                console.error('Error fetching selected addons count data:', error);
                deferred.reject(error);
            });
        return deferred.promise;
    };

    // Admin Analytics Endpoints
    this.getCarDescriptionStats = (params) => {
        const deferred = $q.defer();
        $http.get(`${ApiService.baseURL}/api/admin/analytics/car-description`, { params, withCredentials: true })
            .then(response => {
                deferred.resolve(response.data);
            })
            .catch(error => {
                console.error('Error fetching car description stats:', error);
                deferred.reject(error);
            });
        return deferred.promise;
    };

    this.getTop10PopularCarModels = (params) => {
        const deferred = $q.defer();
        $http.get(`${ApiService.baseURL}/api/admin/analytics/popular-cars`, { params, withCredentials: true })
            .then(response => {
                deferred.resolve(response.data);
            })
            .catch(error => {
                console.error('Error fetching popular car models:', error);
                deferred.reject(error);
            });
        return deferred.promise;
    };

    this.getTop3MostReviewedCars = (params) => {
        const deferred = $q.defer();
        $http.get(`${ApiService.baseURL}/api/admin/analytics/most-reviewed`, { params, withCredentials: true })
            .then(response => {
                deferred.resolve(response.data);
            })
            .catch(error => {
                console.error('Error fetching most reviewed cars:', error);
                deferred.reject(error);
            });
        return deferred.promise;
    };

    this.getTop3OwnersWithMostCars = (params) => {
        const deferred = $q.defer();
        $http.get(`${ApiService.baseURL}/api/admin/analytics/top-owners`, { params, withCredentials: true })
            .then(response => {
                deferred.resolve(response.data);
            })
            .catch(error => {
                console.error('Error fetching top owners:', error);
                deferred.reject(error);
            });
        return deferred.promise;
    };

    this.getBiddingsPerCity = (params) => {
        const deferred = $q.defer();
        $http.get(`${ApiService.baseURL}/api/admin/analytics/biddings-per-city`, { params, withCredentials: true })
            .then(response => {
                deferred.resolve(response.data);
            })
            .catch(error => {
                console.error('Error fetching biddings per city:', error);
                deferred.reject(error);
            });
        return deferred.promise;
    };

    this.getUserGrowthStats = (params) => {
        const deferred = $q.defer();
        $http.get(`${ApiService.baseURL}/api/admin/analytics/user-growth`, { params, withCredentials: true })
            .then(response => {
                deferred.resolve(response.data);
            })
            .catch(error => {
                console.error('Error fetching user growth stats:', error);
                deferred.reject(error);
            });
        return deferred.promise;
    };

    this.getHighestEarningCities = (params) => {
        const deferred = $q.defer();
        $http.get(`${ApiService.baseURL}/api/admin/analytics/highest-earning-cities`, { params, withCredentials: true })
            .then(response => {
                deferred.resolve(response.data);
            })
            .catch(error => {
                console.error('Error fetching highest earning cities:', error);
                deferred.reject(error);
            });
        return deferred.promise;
    };

    this.getNewUsers = (params) => {
        const deferred = $q.defer();
        $http.get(`${ApiService.baseURL}/api/admin/analytics/new-users`, { params, withCredentials: true })
            .then(response => {
                deferred.resolve(response.data);
            })
            .catch(error => {
                console.error('Error fetching new users:', error);
                deferred.reject(error);
            });
        return deferred.promise;
    };

    this.getTop3CompaniesWithMostNegativeReviews = (params) => {
        const deferred = $q.defer();
        $http.get(`${ApiService.baseURL}/api/admin/analytics/top-3-companies-with-most-negative-reviews`, { params, withCredentials: true })
            .then(response => {
                deferred.resolve(response.data);
            })
            .catch(error => {
                console.error('Error fetching top 3 companies with most negative reviews:', error);
                deferred.reject(error);
            });
        return deferred.promise;
    };
});