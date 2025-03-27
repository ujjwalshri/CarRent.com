angular.module('myApp').service('UserService', function($http, ApiService, $q) {
    /* 
    function to get user profile
    @params none
    @returns user profile
    */
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

    /* 
    function to update user profile 
    @params data
    @returns updated user profile
    */
    this.updateUserProfile = (data)=>{
        let deferred = $q.defer();
        $http.patch(`${ApiService.baseURL}/api/user/updateUserProfile`, data, { withCredentials: true })
        .then((res)=>{
            deferred.resolve(res);
        })
        .catch(err=>{
            deferred.reject("Error updating user profile");
            console.log(err);
        })
        return deferred.promise;

    }
    /*
    function to get all users
    @params city, search
    @returns all users
    */
    this.getAllUsers = (city, search)=>{
        console.log(city);
        let deferred = $q.defer();
        $http.get(`${ApiService.baseURL}/api/user/getAllUsers`, { params: {
            city: city, 
            search: search
        } , withCredentials: true })
        .then((res)=>{
            deferred.resolve(res.data);
        })
        .catch(err=>{
            deferred.reject("Error fetching users");
        })
        return deferred.promise;
    }
    /*
    function to block a user and then delete all its cars
    @params userId
    @returns blocked user
    */
    this.blockUser = (userId)=>{
        let deferred = $q.defer();
        $http.patch(`${ApiService.baseURL}/api/user/blockUser/${userId}`, { withCredentials: true })
        .then((res)=>{
            deferred.resolve(res.data);
        })
        .catch(err=>{
            deferred.reject("Error blocking user");
        })
        return deferred.promise
    }
    /*
    function to unblock a user and bring back all its cars
    @params userId
    @returns unblocked user
    */
    this.unblockUser = (userId)=>{
        let deferred = $q.defer();
        $http.patch(`${ApiService.baseURL}/api/user/unblockUser/${userId}`, { withCredentials: true })
        .then((res)=>{
            deferred.resolve(res.data);
        })
        .catch(err=>{
            deferred.reject("Error unblocking user");
        })
        return deferred.promise
    }
});