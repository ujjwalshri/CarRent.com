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
     * Function to update only user city
     * @param {string} city - The new city value
     * @returns {Promise} Promise resolving with updated user data
     */
    this.updateUserCity = (city) => {
        let deferred = $q.defer();
        $http.patch(`${ApiService.baseURL}/api/user/updateUserCity`, { city }, { withCredentials: true })
        .then((res) => {
            deferred.resolve(res);
        })
        .catch(err => {
            deferred.reject("Error updating user city");
            console.log(err);
        });
        return deferred.promise;
    }

    /**
     * Function to get all users
     * @param {*} city - City filter
     * @param {*} search - Search query
     * @param {*} skip - Number of records to skip (pagination)
     * @param {*} limit - Number of records to return
     * @param {*} userType - Type of users to filter (seller, buyer, or all)
     * @returns all users
     */
    this.getAllUsers = (city, search, skip, limit, userType = 'seller') => {
        let deferred = $q.defer();
        $http.get(`${ApiService.baseURL}/api/user/getAllUsers`, { 
            params: {
                city: city, 
                search: search, 
                skip: skip, 
                limit: limit,
                userType: userType
            }, 
            withCredentials: true 
        })
        .then((res) => {
            deferred.resolve(res.data);
        })
        .catch(err => {
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