angular.module('myApp').service('SellerAnalyticsService', function($http, $q, ApiService) {
  
  /**
   * function to get the total revenue for seller
   * @param {*} params 
   * @returns total revenue for seller
   */
  this.getTotalRevenue = (params) => {
      let deferred = $q.defer();
      $http.get(`${ApiService.baseURL}/api/seller/analytics/revenue`, { params, withCredentials: true })
          .then((response) => {
              deferred.resolve(response.data);
          })
          .catch((error) => {
              console.error('Error fetching revenue data:', error);
              deferred.reject(error);
          });
      return deferred.promise;
  };
  
  /**
   * function to get the total revenue by addons for seller
   * @param {*} params 
   * @returns total revenue by addons for seller
   */
  this.getTotalRevenueByAddons = (params) => {
      let deferred = $q.defer();
      $http.get(`${ApiService.baseURL}/api/seller/analytics/total-revenue-by-addons`, { params, withCredentials: true })
          .then((response) => {
              deferred.resolve(response.data);
          })
          .catch((error) => {
              console.error('Error fetching total revenue by addons data:', error);
              deferred.reject(error);
          });
      return deferred.promise;
  };
  
  /**
   * function to get the car description for seller
   * @param {*} params 
   * @returns car description for seller
   */
  this.getCarDescription = (params) => {
      let deferred = $q.defer();
      $http.get(`${ApiService.baseURL}/api/seller/analytics/car-description`, { params, withCredentials: true })
          .then((response) => {
              deferred.resolve(response.data);  
          })
          .catch((error) => {
              console.error('Error fetching car description data:', error);
              deferred.reject(error);
          });
      return deferred.promise;
  };

  /**
   * function to get the popular cars for seller
   * @param {*} params 
   * @returns popular cars for seller
   */
  this.getPopularCars = (params) => {
      let deferred = $q.defer();
      $http.get(`${ApiService.baseURL}/api/seller/analytics/popular-cars`, { params, withCredentials: true })
          .then((response) => {
              deferred.resolve(response.data);
          })
          .catch((error) => {
              console.error('Error fetching popular cars data:', error);
              deferred.reject(error); 
          });
      return deferred.promise;
  };
  
  /**
   * fucntion to get the earning comparison for seller
   * @param params 
   * @returns returns the earning comparison data
   */
  this.getEarningComparison = (params)=>{
    let deferred = $q.defer();
    $http.get(`${ApiService.baseURL}/api/seller/analytics/earning-comparison`, { params, withCredentials: true })
        .then((response) => {
            deferred.resolve(response.data);
        })
        .catch((error) => {
            console.error('Error fetching earning comparison data:', error);
            deferred.reject(error);
        });
    return deferred.promise;
  }

  /**
   * function to get the car-wise bookings for seller
   * @param {*} params 
   * @returns car-wise bookings for seller
   */
  this.getCarWiseBookings = (params) => {
      let deferred = $q.defer();
      $http.get(`${ApiService.baseURL}/api/seller/analytics/car-wise-bookings`, { params, withCredentials: true })
          .then((response) => {
              deferred.resolve(response.data);
          })
          .catch((error) => {
              console.error('Error fetching car-wise bookings data:', error);
              deferred.reject(error);
          });
      return deferred.promise;
  };

  /**
   * function to get the negative reviews for seller
   * @param {*} params 
   * @returns negative reviews for seller
   */
  this.getNegativeReviews = (params) => {
      let deferred = $q.defer();
      $http.get(`${ApiService.baseURL}/api/seller/analytics/negative-reviews`, { params, withCredentials: true })
          .then((response) => {
              deferred.resolve(response.data);
          })
          .catch((error) => {
              console.error('Error fetching negative reviews data:', error);
              deferred.reject(error);
          });
      return deferred.promise;
  };

  /**
   * function to get the top earning cars for seller
   * @param {*} params 
   * @returns top earning cars for seller
   */
  this.getTopEarningCars = (params) => {
      let deferred = $q.defer();
      $http.get(`${ApiService.baseURL}/api/seller/analytics/top-earning-cars`, { params, withCredentials: true })
          .then((response) => {
              deferred.resolve(response.data);
          })
          .catch((error) => {
              console.error('Error fetching top earning cars data:', error);
              deferred.reject(error);
          });
      return deferred.promise;
  };

  /**
   * function to get the peak hours for seller
   * @param {*} params 
   * @returns peak hours for seller
   */
  this.getPeakHours = (params) => {
      let deferred = $q.defer();
      $http.get(`${ApiService.baseURL}/api/seller/analytics/peak-hours`, { params, withCredentials: true })
          .then((response) => {
              deferred.resolve(response.data);
          })
          .catch((error) => {
              console.error('Error fetching peak hours data:', error);
              deferred.reject(error);
          });
      return deferred.promise;
  };

  /**
   * function to get the monthly bookings for seller
   * @param {*} params 
   * @returns monthly bookings for seller
   */
  this.getMonthlyBookings = (params) => {
      let deferred = $q.defer();
      $http.get(`${ApiService.baseURL}/api/seller/analytics/monthly-bookings`, { params, withCredentials: true })
          .then((response) => {
              deferred.resolve(response.data);
          })
          .catch((error) => {
              console.error('Error fetching monthly bookings data:', error);
              deferred.reject(error);
          });
      return deferred.promise;
  };

  /**
   * function to get the top customers for seller
   * @param {*} params 
   * @returns top customers for seller
   */
  this.getTopCustomers = (params) => {
      let deferred = $q.defer();
      $http.get(`${ApiService.baseURL}/api/seller/analytics/top-customers`, { params, withCredentials: true })
          .then((response) => {
              deferred.resolve(response.data);
          })
          .catch((error) => {
              console.error('Error fetching top customers data:', error);
              deferred.reject(error);
          });
      return deferred.promise;
  };

  /**
   * function to get the average rental duration for seller
   * @param {*} params 
   * @returns average rental duration for seller
   */
  this.getAverageRentalDuration = (params) => {
      let deferred = $q.defer();
      $http.get(`${ApiService.baseURL}/api/seller/analytics/average-rental-duration`, { params, withCredentials: true })
          .then((response) => {
              deferred.resolve(response.data);
          })
          .catch((error) => {
              console.error('Error fetching average rental duration data:', error);
              deferred.reject(error);
          });
      return deferred.promise;
  };

  /**
   * function to get the repeating customers percentage for seller
   * @param {*} params 
   * @returns repeating customers percentage for seller
   */
  this.getRepeatingCustomersPercentage = (params) => {
      let deferred = $q.defer();
      $http.get(`${ApiService.baseURL}/api/seller/analytics/repeating-customers`, { params, withCredentials: true })
          .then((response) => {
              deferred.resolve(response.data);
          })
          .catch((error) => {
              console.error('Error fetching repeating customers data:', error);
              deferred.reject(error);
          });
      return deferred.promise;
  };

  /**
   * function to get the city-wise bookings for seller
   * @param {*} params 
   * @returns city-wise bookings for seller
   */
  this.getCityWiseBookings = (params) => {
      let deferred = $q.defer();
      $http.get(`${ApiService.baseURL}/api/seller/analytics/city-wise-bookings`, { params, withCredentials: true })
          .then((response) => {
              deferred.resolve(response.data);
          })
          .catch((error) => {
              console.error('Error fetching city-wise bookings data:', error);
              deferred.reject(error);
          });
      return deferred.promise;
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

  /**
   * Function to get AI-generated review insights based on the date range
   * @param {Object} params - Parameters containing startDate and endDate
   * @returns {Promise} Promise that resolves with AI-generated review insights
   */
  this.getReviewInsights = (params) => {
      const deferred = $q.defer();
      $http.get(`${ApiService.baseURL}/api/gemini/review-summary`, { params, withCredentials: true })
          .then(response => {
              deferred.resolve(response.data);
          })
          .catch(error => {
              console.error('Error fetching AI review insights:', error);
              deferred.reject(error);
          });
      return deferred.promise;
  };

  this.getCityWiseEarnings = (params)=>{
    const deferred = $q.defer();
    $http.get(`${ApiService.baseURL}/api/seller/analytics/city-wise-earning`, { params, withCredentials: true })
        .then(response => {
            deferred.resolve(response.data);
        })
        .catch(error => {
            console.error('Error fetching city wise earnings data:', error);
            deferred.reject(error);
        });
    return deferred.promise;
  }

  
});