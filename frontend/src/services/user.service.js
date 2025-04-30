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

    // Get car addons
    this.getCarAddons = function() {
        return $http.get(`${ApiService.baseURL}/api/bidding/getAllAddons`, { withCredentials: true })
            .then(function(response) {
                return response.data;
            })
            .catch(function(error) {
                return error
            });
    }

    // Add car addon
    this.addCarAddon = function(addon) {
        return $http.post(`${ApiService.baseURL}/api/bidding/addAddon`, addon, { withCredentials: true })
            .then(function(response) {
                return response.data;
            })
            .catch(function(error) {
                return error
            });
    }

    // Remove car addon
    this.removeCarAddon = function(addonId) {
        return $http.delete(`${ApiService.baseURL}/api/bidding/deleteAddon/${addonId}` , { withCredentials: true })
            .then(function(response) {
                console.log(response);
                return response.data;
            })
            .catch(function(error) {
                return error
            });
    }
    /**
     * Function to get the user at the userId
     * @param {string} userId - the userId of the user to get
     * @returns {object} - the user object
     */
    this.getUserAtUserId = (userId)=>{
        let deferred = $q.defer();
        $http.get(`${ApiService.baseURL}/api/user/getUserAtUserId/${userId}`, { withCredentials: true })
        .then((res)=>{
            deferred.resolve(res.data);
        })
        .catch(err=>{
            deferred.reject("Error fetching user at userId");
        })
        return deferred.promise;
    }

    /**
     * Function to get the seller rating
     * @param {string} sellerId - The seller id
     * @returns {object} - The seller rating
     */
    this.getSellerRating = (sellerId)=>{
        let deferred = $q.defer();
        $http.get(`${ApiService.baseURL}/api/seller/analytics/seller-rating/${sellerId}`, { withCredentials: true })
        .then((res)=>{
            deferred.resolve(res.data);
        })
        .catch(err=>{
            deferred.reject("Error fetching seller rating");
        })
        return deferred.promise;
    }
});