angular.module('myApp').service('UserService', ['$http', 'ApiService', '$q', 
function($http, ApiService, $q) {
    this.getUserProfile = function() {
        let deferred = $q.defer();
        $http.get(`${ApiService.baseURL}/api/auth/me`, { withCredentials: true })
            .then((res) => {
                deferred.resolve(res);
            })
            .catch(err => {
                deferred.reject("Error fetching user profile");
                console.log(err);
            });
        return deferred.promise;
    };

    this.getAllUsers = function(city, search, skip, limit, userType = 'seller') {
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
        });
        return deferred.promise;
    };

    this.blockUser = function(userId) {
        let deferred = $q.defer();
        $http.patch(`${ApiService.baseURL}/api/user/blockUser/${userId}`, {}, { withCredentials: true })
            .then((res) => {
                deferred.resolve(res.data);
            })
            .catch(err => {
                deferred.reject("Error blocking user");
            });
        return deferred.promise;
    };

    this.unblockUser = function(userId) {
        let deferred = $q.defer();
        $http.patch(`${ApiService.baseURL}/api/user/unblockUser/${userId}`, {}, { withCredentials: true })
            .then((res) => {
                deferred.resolve(res.data);
            })
            .catch(err => {
                deferred.reject("Error unblocking user");
            });
        return deferred.promise;
    };

    this.getUserAtUserId = function(userId) {
        let deferred = $q.defer();
        $http.get(`${ApiService.baseURL}/api/user/getUserAtUserId/${userId}`, { withCredentials: true })
            .then((res) => {
                deferred.resolve(res.data);
            })
            .catch(err => {
                deferred.reject("Error fetching user at userId");
            });
        return deferred.promise;
    };

    this.getSellerRating = function(sellerId) {
        let deferred = $q.defer();
        $http.get(`${ApiService.baseURL}/api/seller/analytics/seller-rating/${sellerId}`, { withCredentials: true })
            .then((res) => {
                deferred.resolve(res.data);
            })
            .catch(err => {
                deferred.reject("Error fetching seller rating");
            });
        return deferred.promise;
    };
}]);