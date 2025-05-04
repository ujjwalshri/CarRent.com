angular.module('myApp').service('RecommendationService', function($http, $q, $rootScope, ToastService, ApiService) {   

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
})