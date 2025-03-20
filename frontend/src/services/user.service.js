angular.module('myApp').service('UserService', function($http, ApiService, $q) {
    this.getUserProfile = ()=>{
        let deferred = $q.defer();
        $http.get(`${ApiService.baseURL}/api/auth/me`, { withCredentials: true })
        .then((res)=>{
            deferred.resolve(res);
        })
        .catch(err=>{
            deferred.reject("Error fetching user profile");
            console.log(err);
        })
        return deferred.promise;
    }
});