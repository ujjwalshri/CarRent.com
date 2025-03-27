angular.module('myApp').service('RouteProtection', function($http, ApiService,$q) {
   /*
   function to get all the loggedInUser details
      @params none
      @returns none
   */
   this.getLoggedinUser = ()=>{
         let deferred = $q.defer();
         $http.get(`${ApiService.baseURL}/api/auth/me`, { withCredentials: true })
         .then((res)=>{
            deferred.resolve(res.data);
         })
         .catch(err=>{
            deferred.reject("Error fetching user");
         })
         return deferred.promise;
   }
});