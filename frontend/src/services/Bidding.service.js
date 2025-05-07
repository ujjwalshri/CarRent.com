angular.module('myApp').service('BiddingService', function($q, ApiService, $http) {
   /**
    * Add a bid
    * @param {string} carId - The ID of the car
    * @param {object} bid - The bid object
    * @returns promise
    */
    this.addBid = function(carId, bid) {
        const deferred = $q.defer();
        
        // Send the bid to the server
        $http.post(`${ApiService.baseURL}/api/bidding/addBid/${(carId).toString()}`, bid, { withCredentials: true })
            .then((res) => {
                // Don't show success message here, wait for socket notification
                deferred.resolve({ status: 'pending', message: 'Processing bid...' });
            })
            .catch((err) => {
                console.log(err);
                deferred.reject(`Error adding the bidding: ${err}`);
            });
        return deferred.promise;
    };
    /**
     * Get all the bids for a particular owner
     * @param {object} params - The parameters object
     * @returns promise
     */
    this.getOwnerBids = function(params){
        params.sortBy = JSON.stringify(params.sortBy);
        let deferred = $q.defer();
        $http.get(`${ApiService.baseURL}/api/bidding/getBids/owner`, {params:params, withCredentials: true })
        .then((res)=>{
            deferred.resolve(res.data);
        })
        .catch(err=>{
            deferred.reject(`Error fetching bids: ${err}`);
        })
        return deferred.promise;
    }
   /**
    * Approve a bid
    * @param {string} bidId - The ID of the bid
    * @returns promise
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
    /**
     * Reject a bid
     * @param {string} bidId - The ID of the bid
     * @returns promise
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
    /**
     * Get all the bookings for a particular owner
     * @param {object} params - The parameters object
     * @returns promise
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
    
    /**
     * Get all the biddings for a particular user
     * @param {object} params - The parameters object
     * @returns promise
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
   
    /**
     * Get all the bookings for a particular user
     * @param {object} params - The parameters object
     * @returns promise
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
    /**
     * Get all the bookings history for a particular user
     * @param {object} params - The parameters object
     * @returns promise
     */
    this.getUserBookingsHistory = (params) => {
        console.log('getUserBookingsHistory called with params:', JSON.stringify(params));
        
        // Ensure params is an object
        const requestParams = { ...params };
        
        // Make sure we don't modify the original params object
        let deferred = $q.defer();
        
        // Send the request
        $http.get(`${ApiService.baseURL}/api/bidding/getBookingsHistory/user`, { 
            params: requestParams, 
            withCredentials: true 
        })
        .then((res) => {
            console.log(`Received ${res.data.bookings?.length || 0} bookings from API`);
            deferred.resolve(res.data);
        })
        .catch(err => {
            console.error('Error in getUserBookingsHistory:', err);
            deferred.reject(`Error fetching user bookings: ${err}`);
        });
        
        return deferred.promise;
    }
    /**
     * Get a particular bid
     * @param {string} biddingId - The ID of the bid
     * @returns promise
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
    /**
     * Start a booking
     * @param {string} bookingId - The ID of the booking
     * @param {number} startOdometerValue - The start odometer value
     * @returns promise
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
    /**
     * End a booking
     * @param {string} bookingId - The ID of the booking
     * @param {number} endOdometerValue - The end odometer value
     * @returns promise
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
    /**
     * Get all the addons for a particular user
     * @param {string} ownerId - The ID of the owner
     * @returns promise
     */
    this.getAddOnsForUser = function(ownerId){
        let deferred = $q.defer();
        $http.get(`${ApiService.baseURL}/api/bidding/getAddOnsForUser/${ownerId}`, { withCredentials: true })
        .then((res)=>{
            deferred.resolve(res.data);
        })
        .catch(err=>{
            deferred.reject(`Error fetching addons: ${err}`);
        })
        return deferred.promise;
    }

    
    /**
     * Get overlapping bids for a specific bid
     * @param {string} bidId - The ID of the bid
     * @returns promise
     */
    this.getOverlappingBids = function(bidId) {
        let deferred = $q.defer();
        $http.get(`${ApiService.baseURL}/api/bidding/getOverlappingBids/${bidId}`, { withCredentials: true })
        .then((res) => {
            deferred.resolve(res.data);
        })
        .catch(err => {
            deferred.reject(`Error fetching overlapping bids: ${err}`);
        });
        return deferred.promise;
    }
 });