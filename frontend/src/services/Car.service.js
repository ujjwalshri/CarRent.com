angular.module('myApp').service('CarService', function($http, ApiService, $q) {
    this.getAllApprovedCars = ()=>{
        let deferred = $q.defer();
        $http.get(`${ApiService.baseURL}/api/vehicle/allApprovedVehicles`)
        .then((res)=>{
            deferred.resolve(res);
            console.log(res);
        })
        .catch(err=>{
            deferred.reject("Error fetching cars");
            console.log(err);
        })
        return deferred.promise;
    }
    this.getCarById = (carId)=>{
        let deferred = $q.defer();
        $http.get(`${ApiService.baseURL}/api/vehicle/getVehicle/${carId}`, { withCredentials: true })
        .then((res)=>{
            deferred.resolve(res);
        })
        .catch(err=>{
            deferred.reject("Error fetching car");
            console.log(err);
        })
        return deferred.promise;
    }
});