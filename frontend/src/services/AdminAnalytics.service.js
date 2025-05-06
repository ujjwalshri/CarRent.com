angular.module('myApp').service('AdminAnalyticsService', function($http, $q, ApiService) {
  
  /**
   * Get general analytics data for admin dashboard
   * @param {Object} params - Query parameters including date range
   * @returns {Promise} Promise with the general analytics data
   */
  this.getGeneralAnalyticsForAdmin = async (params) => {
    let deffered = $q.defer();
    $http.get(`${ApiService.baseURL}/api/admin/getGeneralStats`, {params:params, withCredentials:true})
    .then((response)=>{
      deffered.resolve(response.data);
    })
    .catch((error)=>{
      deffered.reject(error);
    });
    return deffered.promise;
  }
  
  /**
   * Get overview statistics for admin dashboard
   * @param {Object} params - Query parameters including date range
   * @returns {Promise} Promise with the overview stats data
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
  

  
  /**
   * Get customer satisfaction score for admin dashboard
   * @param {Object} params - Query parameters including date range
   * @returns {Promise} Promise with the customer satisfaction data
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
   * Get top performers (sellers and buyers) for admin dashboard
   * @param {Object} params - Query parameters including date range
   * @returns {Promise} Promise with the top performers data
   */
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

  /**
   * Get new user statistics for admin dashboard
   * @param {Object} params - Query parameters including date range
   * @returns {Promise} Promise with the new users data
   */
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

  /**
   * Get car description statistics for admin dashboard
   * @param {Object} params - Query parameters including date range
   * @returns {Promise} Promise with the car description data
   */
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

  /**
   * Get top 10 popular car models for admin dashboard
   * @param {Object} params - Query parameters including date range
   * @returns {Promise} Promise with the popular car models data
   */
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

  /**
   * Get top 3 most reviewed cars for admin dashboard
   * @param {Object} params - Query parameters including date range
   * @returns {Promise} Promise with the most reviewed cars data
   */
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

  /**
   * Get top 3 owners with most cars for admin dashboard
   * @param {Object} params - Query parameters including date range
   * @returns {Promise} Promise with the top owners data
   */
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

  /**
   * Get user growth statistics for admin dashboard
   * @param {Object} params - Query parameters including date range
   * @returns {Promise} Promise with the user growth data
   */
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

  /**
   * Get highest earning cities for admin dashboard
   * @param {Object} params - Query parameters including date range
   * @returns {Promise} Promise with the highest earning cities data
   */
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

  /**
   * Get top 3 companies with most negative reviews for admin dashboard
   * @param {Object} params - Query parameters including date range
   * @returns {Promise} Promise with the companies with negative reviews data
   */
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
  
  /**
   * Get top sellers with most negative reviews for admin dashboard
   * @param {Object} params - Query parameters including date range
   * @returns {Promise} Promise with the sellers with negative reviews data
   */
  this.getTopSellersWithMostNegativeReviews = (params)=>{
      const deferred = $q.defer();
      $http.get(`${ApiService.baseURL}/api/admin/analytics/top-5-sellers-with-most-negative-reviews`, { params, withCredentials: true })
          .then(response => {
              deferred.resolve(response.data);
          })
          .catch(error => {
              console.error('Error fetching top sellers with most negative reviews:', error);
              deferred.reject(error);
          });
      return deferred.promise;
  }

  /**
   * Get bidding statistics per city for admin analytics
   * @param {Object} params - Query parameters including date range
   * @returns {Promise} Promise with the city-wise bidding data
   */
  this.getBiddingsPerCity = (params) => {
      const deferred = $q.defer();
      $http.get(`${ApiService.baseURL}/api/admin/analytics/biddings-per-city`, { params, withCredentials: true })
          .then(response => {
              deferred.resolve(response.data);
          })
          .catch(error => {
              console.error('Error fetching biddings per city data:', error);
              deferred.reject(error);
          });
      return deferred.promise;
  };

  /**
   * Send congratulation email to top performing users
   * @param {Object} emailData - Email data containing recipient and performance metrics
   * @returns {Promise} Promise with the response from the email service
   */
  this.sendCongratulationMail = (emailData) => {
      const deferred = $q.defer();
      $http.post(`${ApiService.baseURL}/api/admin/sendCongratulationMail`, emailData, { withCredentials: true })
          .then(response => {
              deferred.resolve(response.data);
          })
          .catch(error => {
              console.error('Error sending congratulation email:', error);
              deferred.reject(error);
          });
      return deferred.promise;
  };

  /**
   * function to get the category wise bookings
   * @param {Object} params - Query parameters including date range
   * @returns return promise
   */
  this.getCategoryWiseBookings = (params)=>{
        const deferred = $q.defer();
        $http.get(`${ApiService.baseURL}/api/admin/analytics/category-wise-bookings`, { params, withCredentials: true })
            .then(response => {
                deferred.resolve(response.data);
            })
            .catch(error => {
                console.error('Error fetching category-wise bookings:', error);
                deferred.reject(error);
            });
        return deferred.promise;
  }
});