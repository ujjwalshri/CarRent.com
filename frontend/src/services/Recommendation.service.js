angular.module('myApp').service('RecommendationService', function($http, $q, $rootScope, ToastService, ApiService) {   
    /**
     * function to get vehicle recommendation sends params to the server for handling the recommendation
     * @param {*} params 
     * @returns the vehicle recommendation for the logged in user
     */
    this.getVehicleRecommendation = function(params) {
        let deferred = $q.defer();
        $http.get(`${ApiService.baseURL}/api/recommendation/vehicleRecommendation`, { params: params, withCredentials: true })
            .then((res) => {
                deferred.resolve(res.data);
            })
            .catch(err => {
                ToastService.error("Error fetching vehicle recommendation:", err);
                deferred.reject(`Error fetching vehicle recommendation: ${err}`);
            });
        return deferred.promise;
    }
    /**
     * function to get optimal bids recommendation sends params to the server for handling the recommendation
     * @param {*} params 
     * @returns the optimal bids recommendation for the logged in user
     */
    this.optimalBidsRecommendationForSeller = function(params){
        let deferred = $q.defer();
        $http.get(`${ApiService.baseURL}/api/recommendation/optimalBidsRecommendation`, { params: params, withCredentials: true })
            .then((res) => {
                deferred.resolve(res.data);
            })
            .catch(err => {
                ToastService.error("Error fetching optimal bids recommendation for seller:", err);
                deferred.reject(`Error fetching optimal bids recommendation for seller: ${err}`);
            });
        return deferred.promise;
    }
})