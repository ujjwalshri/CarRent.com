angular.module('myApp').service('BiddingService', function($q,BiddingFactory, ApiService, $http) {
    /*
    function to add a bid
    @params carId, bid
    @returns promise
    */
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
    /*
    function to get all the bids for a particular owner
    @params none
    @returns promise
    */
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
    /*
    function to approve a bid
    @params bidId
    @returns promise
    */
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
    /*
    function to reject a bid
    @params bidId
    @returns promise
    */
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
    /*
    function to get all the bookings for a particular owner
    @params none
    @returns promise
    */
    this.getBookingsForOwner = function(params){
        let deffered = $q.defer();
        $http.get(`${ApiService.baseURL}/api/bidding/getBookings/owner`, { params:params, withCredentials: true }).then((res)=>{
            deffered.resolve(res.data);
        }).catch((err)=>{
            deffered.reject(`error fetching bookings ${err}`);
        })
        return deffered.promise;
    }
    /*
    function to get all the biddings for a particular user
    @params none
    @returns promise
    */
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
    /*
    function to get all the bookings for a particular user
    @params none
    @returns promise
    */
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
    /*
    function to get all the bookings history for a particular user
    @params none
    @returns promise
    */
    this.getUserBookingsHistory = (params)=>{
        console.log(params);
        let deferred = $q.defer();
        $http.get(`${ApiService.baseURL}/api/bidding/getBookingsHistory/user`, { params: params, withCredentials: true })
        .then((res)=>{
            deferred.resolve(res.data);
        })
        .catch(err=>{
            deferred.reject("Error fetching user bookings");
        })
        return deferred.promise;
    }
    /*
    function to get a particular bid
    @params none
    @returns promise
    */
    this.getBid = function(biddingId){
        console.log(biddingId);
        let deferred = $q.defer();
        $http.get(`${ApiService.baseURL}/api/bidding/getBid/${biddingId}`, { withCredentials: true })
        .then((res)=>{
            deferred.resolve(res.data);
        })
        .catch(err=>{
            deferred.reject(`Error fetching bid: ${err}`);
        })
        return deferred.promise;
    }
    /*
    function to start a booking
    @params bookingId, startOdometerValue
    @returns promise
    */
    this.startBooking = function(bookingId, startOdometerValue){
        let deferred = $q.defer();
        $http.patch(`${ApiService.baseURL}/api/bidding/startBooking/${bookingId}`, {
            startOdometerValue: startOdometerValue
        }, { withCredentials: true })
        .then((res)=>{
            console.log(res);
            deferred.resolve(res.data.booking);
        })
        .catch(err=>{
            
            deferred.reject(`Error starting booking: ${err}`);
        })
        return deferred.promise;
    }
    /*
    function to end a booking
    @params bookingId, endOdometerValue
    @returns promise
    */
    this.endBooking = function(bookingId, endOdometerValue){
        let deferred = $q.defer();
        $http.patch(`${ApiService.baseURL}/api/bidding/endBooking/${bookingId}`, {
            endOdometerValue: endOdometerValue
        }, { withCredentials: true })
        .then((res)=>{
            deferred.resolve(res.data);
        })
        .catch(err=>{
            deferred.reject(`Error ending booking: ${err}`);
        })
        return deferred.promise;
    }
    
 });