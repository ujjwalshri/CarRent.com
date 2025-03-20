angular.module('myApp').service('RouteProtection', function($http, ApiService) {
    let cachedUser = null;
    this.getMe = async function() {
        if (cachedUser !== null) {
            return cachedUser;
        }
        try {
            const response = await $http.get(`${ApiService.baseURL}/api/auth/me`, { withCredentials: true });
            cachedUser = response.data;
            return cachedUser;
        } catch {
            cachedUser = null;
            return null;
        }
    }();


    this.isAuthorized =  () => {
       return cachedUser?true:false;
    };

    this.isAdmin =  () => {
        if(cachedUser === null){
            return false;
        }
        return cachedUser.isAdmin;
    };

    this.isSeller =  () => {
        if(cachedUser === null){
            return false;
        }
       return cachedUser.isSeller;
    };

    this.isBuyer =  () => {
        if(cachedUser === null){
            return false;
        }
       return cachedUser.isSeller === false;
    };
});