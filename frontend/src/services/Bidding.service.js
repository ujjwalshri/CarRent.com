angular.module('myApp').service('BiddingService', function($q, ApiService, $http) {

    this.addBid = function(carId, bid) {
        console.log('Bid:', bid);
        console.log('Car ID:', carId);
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
    this.getOwnerBids = function(params){
        console.log(params);
        let deferred = $q.defer();
        $http.get(`${ApiService.baseURL}/api/bidding/getBids/owner?page=${params.page}&limit=${params.limit}&status=${params.status}`, { withCredentials: true })
        .then((res)=>{
            deferred.resolve(res.data);
        })
        .catch(err=>{
            deferred.reject(`Error fetching bids: ${err}`);
        })
        return deferred.promise;
    }
    this.approveBid = function(bidId){
        let deferred = $q.defer();
        $http.patch(`${ApiService.baseURL}/api/bidding/updateBookingStatus/${bidId}`, {
            biddingStatus: "approved"
        }, { withCredentials: true })
        .then((res)=>{
            deferred.resolve(res.data);
        })
        .catch(err=>{
            deferred.reject(`Error approving bid: ${err}`);
        })
        return deferred.promise;
    }
    this.rejectBid = function(bidId){
        let deferred = $q.defer();
        $http.patch(`${ApiService.baseURL}/api/bidding/updateBookingStatus/${bidId}`, {
            biddingStatus: "rejected"
        }, { withCredentials: true })
        .then((res)=>{
            deferred.resolve(res.data);
        })
        .catch(err=>{
            deferred.reject(`Error rejecting bid: ${err}`);
        })
        return deferred.promise;
    }
    this.getBookingsForOwner = function(){
        let deffered = $q.defer();
        $http.get(`${ApiService.baseURL}/api/bidding/getBookings/owner`, { withCredentials: true }).then((res)=>{
            deffered.resolve(res.data);
        }).catch((err)=>{
            deffered.reject(`error fetching bookings ${err}`);
        })
        return deffered.promise;
    }
    this.getBiddingsForUser = function (params) {
        console.log(params);
        let deferred = $q.defer();
        $http.get(`${ApiService.baseURL}/api/bidding/getBids/user`, {
            params: params, 
            withCredentials: true 
        })
        .then((res) => {
            deferred.resolve(res.data);
        })
        .catch((err) => {
            deferred.reject(`Error fetching bookings: ${err}`);
        });
    
        return deferred.promise;
    };
    
    this.getBookingsForUser = function(params){
        console.log(params);
        console.log(typeof(params.sort));
        let deffered = $q.defer();
        $http.get(`${ApiService.baseURL}/api/bidding/getBookings/user`, {params:params,  withCredentials: true }).then((res)=>{
            deffered.resolve(res.data);
        }).catch((err)=>{
            deffered.reject(`error fetching bookings ${err}`);
        })
        return deffered.promise
    }
    this.getUserBookingsHistory = ()=>{
        let deferred = $q.defer();
        $http.get(`${ApiService.baseURL}/api/bidding/getBookingsHistory/user`, { withCredentials: true })
        .then((res)=>{
            deferred.resolve(res.data);
        })
        .catch(err=>{
            deferred.reject("Error fetching user bookings");
        })
        return deferred.promise;
    }
 });