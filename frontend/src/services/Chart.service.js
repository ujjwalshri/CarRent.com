angular.module('myApp').service('ChartService', function($http, $q, ApiService) {
    /*
    function to create a pie chart for the given data
    @params labels, data, label, htmlElementId
    @returns creates pie chart
    */
  this.createPieChart = (labels, data, label, htmlElementId) => {
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
    new Chart(ctx, chartConfig);
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
                          fontSize: 14
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
    this.getCarDescription = async (params) => {
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
    function to get the car description for admin
    @params params
    @returns car description for admin
    */
    this.getTop10MostPopularCarsForAdmin = async (params) => {
      let deffered = $q.defer();
      $http.get(`${ApiService.baseURL}/api/admin/getTop10MostPopularCars`, {params:params, withCredentials:true})
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
    this.getSuvVsSedanForAdmin = async (params) => {
      let deffered = $q.defer();
      $http.get(`${ApiService.baseURL}/api/admin/getSuvVsSedan`, {params:params, withCredentials:true})
      .then((response)=>{
        deffered.resolve(response.data);
      })
      .catch((error)=>{
        deffered.reject(error);
      });
      return deffered.promise;
    }
    /*
    function to get the top 3 most reviewed cars for admin
    @params params
    @returns top 3 most reviewed cars for admin
    */
    this.top3MostReviewedCarsForAdmin = async (params) => {
      let deffered = $q.defer();
      $http.get(`${ApiService.baseURL}/api/admin/top3MostReviewedCars`, {params:params, withCredentials:true})
      .then((response)=>{
        deffered.resolve(response.data);
      })
      .catch((error)=>{
        deffered.reject(error);
      });
      return deffered.promise;
    }
    /*
    function to get the top 3 owners with most cars added for admin
    @params params
    @returns top 3 owners with most cars added for admin
    */
    this.top3OwnersWithMostCarsAddedForAdmin = async (params) => {
      let deffered = $q.defer();
      $http.get(`${ApiService.baseURL}/api/admin/getTop3OwnersWithMostCars`, {params:params, withCredentials:true})
      .then((response)=>{
        deffered.resolve(response.data);
      })
      .catch((error)=>{
        deffered.reject(error);
      });
      return deffered.promise;
    }
    /*
    function to get the ongoing bookings for admin
    @params params
    @returns ongoing bookings for admin
    */
    this.getOngoingBookingsForAdmin = async (params) => {
      let deffered = $q.defer();
      $http.get(`${ApiService.baseURL}/api/admin/getOngoingBookings`, {params:params, withCredentials:true})
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
    this.getAverageBookingDurationForAdmin = async (params) => {
      let deffered = $q.defer();
      $http.get(`${ApiService.baseURL}/api/admin/getAverageBookingDuration`, {params:params, withCredentials:true})
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
    this.getBiddingConversionRateForAdmin = async (params) => {
      let deffered = $q.defer();
      $http.get(`${ApiService.baseURL}/api/admin/getBiddingConversionRate`, {params:params, withCredentials:true})
      .then((response)=>{
        deffered.resolve(response.data);
      })
      .catch((error)=>{
        deffered.reject(error);
      });
      return deffered.promise;
    }
    /*
    function to get all blocked users for admin
    @params params
    @returns all blocked users for admin
    */
    this.getNumberOfBlockedUsersForAdmin = async () => {
      let deffered = $q.defer();
      $http.get(`${ApiService.baseURL}/api/admin/getNumberOfBlockedUsers`, { withCredentials:true})
      .then((response)=>{
        deffered.resolve(response.data);
      })
      .catch((error)=>{
        deffered.reject(error);
      });
      return deffered.promise;
    }
    /*
    function to get the number of bidding per car city for admin
    @params params
    @returns number of bidding per car city for admin
    */
    this.numberOfBiddingPerCarCityForAdmin = async () => {
      let deffered = $q.defer();
      $http.get(`${ApiService.baseURL}/api/admin/numberOfBiddingPerCarCity`, { withCredentials:true})
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
    this.numberOfOwnersPerCityForAdmin = async () => {
      let deffered = $q.defer();
      $http.get(`${ApiService.baseURL}/api/admin/numberOfOwnersPerCity`, { withCredentials:true})
      .then((response)=>{
        deffered.resolve(response.data);
      })
      .catch((error)=>{
        deffered.reject(error);
      });
      return deffered.promise;
    }
    /*
    function to get the user description for admin
    @params params
    @returns user description for admin
    */
    this.getUserDescriptionForAdmin = async (params) => {
      let deffered = $q.defer();
      $http.get(`${ApiService.baseURL}/api/admin/getUserDescription`, {params:params, withCredentials:true})
      .then((response)=>{
        deffered.resolve(response.data);
      })
      .catch((error)=>{
        deffered.reject(error);
      });
      return deffered.promise;
    }
    /*
    function to get the number of buyers per city for admin
    @params params
    @returns number of buyers per city for admin
    */
    this.getnumberOfBuyersPerCityForAdmin = async (params) => {
      let deffered = $q.defer();
      $http.get(`${ApiService.baseURL}/api/admin/getnumberOfBuyersPerCity`, {params:params, withCredentials:true})
      .then((response)=>{
        deffered.resolve(response.data);
      })
      .catch((error)=>{
        deffered.reject(error);
      });
      return deffered.promise;
    }
    /*
    function to get the new users in last 30 days for admin
    @params params
    @returns new users in last 30 days for admin
    */
    this.newUsersInLast30DaysForAdmin = async () => { 
      let deffered = $q.defer();
      $http.get(`${ApiService.baseURL}/api/admin/newUsersInLast30Days`, { withCredentials:true})
      .then((response)=>{
        deffered.resolve(response.data);
      })
      .catch((error)=>{
        deffered.reject(error);
      });
      return deffered.promise;

    }
})