angular.module('myApp').service('BiddingService', function($q, ApiService, $http) {

    this.addBid = function(carId, bid) {
        console.log('Bid:', bid);
        console.log('Car ID:', carId);
 
        // Validate bid object
        if (typeof bid !== 'object' || bid === null) {
            return $q.reject('Invalid bid object');
        }
 
        const deferred = $q.defer();
        $http.post(`${ApiService.baseURL}/api/bidding/addBid/${(carId).toString()}`, bid, { withCredentials: true })
            .then((res) => {
                console.log(res);
                deferred.resolve('Bidding added successfully');
            })
            .catch((err) => {
                console.log(err);
                deferred.reject(`Error adding the bidding: ${err}`);
            });
        return deferred.promise;
    };
 
 });