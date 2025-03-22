angular.module('myApp').service('CarService', function($http, ApiService, $q) {
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
    this.getReviewsByCarId = (carId)=>{
        console.log(carId);
        let deferred = $q.defer();
        $http.get(`${ApiService.baseURL}/api/review/getAllReviews/car/${carId}`, { withCredentials: true })
        .then((res)=>{
            deferred.resolve(res);
        })
        .catch(err=>{
            deferred.reject("Error fetching reviews");
            console.log(err);
        })
        return deferred.promise;
    }
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
    this.fetchUserCars = (status)=>{
        let deferred = $q.defer();
        $http.get(`${ApiService.baseURL}/api/vehicle/getAllCarsByUser?carStatus=${status}`, { withCredentials: true })
        .then((res)=>{
            deferred.resolve(res);
        })
        .catch(err=>{
            deferred.reject("Error fetching user cars");
            console.log(err);
        })
        return deferred.promise;

    }
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
    
});