angular.module('myApp').service('UserService', function($http, ApiService, $q) {
    
    /**
     * Get the user profile
     * @returns user profile
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

   /**
    * Function to update user profile
    * @param {*} data 
    * @returns 
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
    /**
     * Function to get all users
     * @param {*} city 
     * @param {*} search 
     * @param {*} skip 
     * @param {*} limit 
     * @returns all users
     */
    this.getAllUsers = (city, search, skip, limit)=>{
        console.log(city);
        let deferred = $q.defer();
        $http.get(`${ApiService.baseURL}/api/user/getAllUsers`, { params: {
            city: city, 
            search: search, 
            skip: skip, 
            limit: limit
        } , withCredentials: true })
        .then((res)=>{
            deferred.resolve(res.data);
        })
        .catch(err=>{
            deferred.reject("Error fetching users");
        })
        return deferred.promise;
    }
    /**
     * Function to block a user and then delete all its cars
     * @param {*} userId 
     * @returns blocked user
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
    /**
     * Function to unblock a user and bring back all its cars
     * @param {*} userId 
     * @returns unblocked user
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