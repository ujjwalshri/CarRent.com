angular.module('myApp').service('RouteProtection', function($http, ApiService) {
   

    this.isAuthorized =  () => {
       
       return true;
    };

    this.isAdmin =  () => {
       
        return false;
    };

    this.isSeller =  () => {
      
       return false;
    };

    this.isBuyer =  () => {
      
       return true;
    };
});