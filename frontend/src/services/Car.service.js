angular.module('myApp').service('CarService', function($http, ApiService, $q) {
    /*
    function to get all approved cars
    @params search, price, city, category, skip
    @returns promise
    */
    this.getAllApprovedCars = (search, price, city,category, skip)=>{
        console.log('skip', skip);
        let deferred = $q.defer();
        $http.get(`${ApiService.baseURL}/api/vehicle/allApprovedVehicles?search=${search===undefined?'':search}&priceRange=${price}&city=${city}&category=${category}&skip=${skip}`, { withCredentials: true })
        .then((res)=>{
            deferred.resolve(res);
            console.log(res);
        })
        .catch(err=>{
            deferred.reject("Error fetching cars");
            console.log(err);
        })
        return deferred.promise;
    }
    /*
    function to get a car by id
    @params carId
    @returns promise
    */
    this.getCarById = (carId)=>{
        let deferred = $q.defer();
        $http.get(`${ApiService.baseURL}/api/vehicle/getVehicle/${carId}`, { withCredentials: true })
        .then((res)=>{
            deferred.resolve(res);
        })
        .catch(err=>{
            deferred.reject("Error fetching car");
            console.log(err);
        })
        return deferred.promise;
    }
    /*
    function to get reviews by car id
    @params carId
    @returns promise
    */
    this.getReviewsByCarId = (carId, params)=>{
        console.log(carId);
        let deferred = $q.defer();
        $http.get(`${ApiService.baseURL}/api/review/getAllReviews/car/${carId}`, { params:params, withCredentials: true })
        .then((res)=>{
            deferred.resolve(res);
        })
        .catch(err=>{
            deferred.reject("Error fetching reviews");
            console.log(err);
        })
        return deferred.promise;
    }
    /*
    function to get bookings at car id
    @params carId
    @returns promise
    */
    this.fetchBookingsAtCarId = (carId)=>{
        console.log(carId);
        let deferred = $q.defer();
        $http.get(`${ApiService.baseURL}/api/bidding/getBookings/car/${carId}`, { withCredentials: true }).then((res)=>{
            console.log("bookings", res.data.bookings);
            deferred.resolve(res.data.bookings);
        }).catch(err=>{
            deferred.reject(`error fetching the bookings ${err}`);
        })
        return deferred.promise;
    }
    /*
    function to add a car
    @params car
    @returns promise
    */
    this.addCar = (car)=>{
        let deferred = $q.defer();
        $http.post(`${ApiService.baseURL}/api/vehicle/addVehicle`, car, { withCredentials: true,   
            headers: { 'Content-Type': undefined },
            transformRequest: angular.identity
         }, )
        .then((res)=>{
            deferred.resolve(res.data);
        })
        .catch(err=>{
            deferred.reject("Error adding car");
            console.log(err);
        })
        return deferred.promise;
    }
    /*
    function to fetch user cars
    @params status, params
    @returns promise
    */
    this.fetchUserCars = (status, params)=>{
        let deferred = $q.defer();
        $http.get(`${ApiService.baseURL}/api/vehicle/getAllCarsByUser?carStatus=${status}`, {params:params, withCredentials: true })
        .then((res)=>{
            deferred.resolve(res);
        })
        .catch(err=>{
            deferred.reject("Error fetching user cars");
            console.log(err);
        })
        return deferred.promise;

    }
    /*
    function to delete a car
    @params carId
    @returns promise
    */
    this.getCars = ()=>{
        let deferred = $q.defer();
        $http.get(`${ApiService.baseURL}/api/vehicle/getPendingCars`, { withCredentials: true })
        .then((res)=>{
            deferred.resolve(res.data);
        })
        .catch(err=>{
            deferred.reject("Error fetching cars");
        })
        return deferred.promise;

    }
    /*
    function to approve a car
    @params carId
    @returns promise
    */
    this.approveCar= (carId)=>{
        let deferred = $q.defer();
        $http.patch(`${ApiService.baseURL}/api/vehicle/toggleVehicleStatus/${carId}`,{
           vehicleStatus: 'approved'
        },{ withCredentials: true })
        .then((res)=>{
            deferred.resolve(`car approved successfully`);
        })
        .catch(err=>{
            deferred.reject("Error approving car");
        })
        return deferred.promise;
    }
    /*
    function to reject a car
    @params carId
    @returns promise
    */
    this.rejectCar= (carId)=>{
        let deferred = $q.defer();
        $http.patch(`${ApiService.baseURL}/api/vehicle/toggleVehicleStatus/${carId}`,{
           vehicleStatus: 'rejected'
        },{ withCredentials: true })
        .then((res)=>{
            deferred.resolve(`car rejected successfully`);
        })
        .catch(err=>{
            deferred.reject(`Error rejecting car ${err}`);
        })
        return deferred.promise;
    }
    /*
    function to delete a car
    @params carId
    @returns promise
    */
    this.listUnlistCar = (carId)=>{
        console.log(carId);
        let deferred = $q.defer();
        $http.patch(`${ApiService.baseURL}/api/vehicle/listUnlistCar/${carId}`,{ withCredentials: true })
        .then((res)=>{
            deferred.resolve(`car listed successfully`);
        })
        .catch(err=>{
            deferred.reject(`Error listing car ${err}`);
        })
        return deferred.promise;
    }
    /*
    function to delete a car
    @params carId
    @returns promise
    */
    this.addReview = (carId, review, bookingId)=>{
        console.log(carId, review, bookingId);
        let deferred = $q.defer();
        $http.post(`${ApiService.baseURL}/api/review/addReview/car/${carId}`, review, {params:{bookingId: bookingId}, withCredentials: true })
        .then((res)=>{
            deferred.resolve(res.data);
        })
        .catch(err=>{
            deferred.reject(`Error adding review ${err}`);
        })
        return deferred.promise;
    }
    /*
    function to get all cars
    @params none
    @returns promise
    */
    this.updateCarPrice = (carId, price)=>{
        let deferred = $q.defer();
        $http.patch(`${ApiService.baseURL}/api/vehicle/updateVehicle/${carId}`, {price: price}, { withCredentials: true })
        .then((res)=>{
            deferred.resolve(res.data);
        })
        .catch(err=>{
            deferred.reject(err);
        })
        return deferred.promise;
    }
    /*
    function to get all cars
    @params none
    @returns promise
    */
    this.getNumberOfBidsPerCarLocationForSeller = async (params) => {
        console.log("params", params);
        let deferred = $q.defer();
        $http.get(`${ApiService.baseURL}/api/seller/numberOfBidsPerCarLocation`, {params:params, withCredentials:true})
        .then((response)=>{
          console.log("response", response.data);
          deferred.resolve(response.data);
        })
        .catch((error)=>{
          deferred.reject(error);
        });
        return deferred.promise;
      }
      
    /*
    function to get car recommendations for user
    @params none
    @returns promise
    */
    this.getCarRecommendationsForUser = ()=>{
        let deferred = $q.defer();
        $http.get(`${ApiService.baseURL}/api/bidding/getCarRecommendation`, { withCredentials: true })
        .then((res)=>{
            deferred.resolve(res.data);
        })
        .catch((error)=>{
            deferred.reject(error);
        });
        return deferred.promise;
    }
    
});