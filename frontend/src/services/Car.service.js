/**
 * Car Service
 * 
 * This Angular service handles all vehicle-related operations in the car rental application.
 * It provides methods for retrieving, creating, updating, and managing vehicles, 
 * as well as related operations like reviews and bookings.
 * 
 * The service communicates with the backend API endpoints for vehicles and related entities.
 */
angular.module('myApp').service('CarService', function($http, ApiService, $q) {
    /*
    function to get all approved cars
    @params search, price, city, category, skip
    @returns promise
    */
    /**
     * Get All Approved Cars
     * Retrieves approved vehicles with optional filtering and pagination support
     * 
     * @param {string} search - Optional search term for vehicle name/company
     * @param {string} price - Optional price range filter
     * @param {string} city - Optional city filter
     * @param {string} category - Optional vehicle category filter (SUV, Sedan, etc.)
     * @param {number} skip - Number of records to skip for pagination
     * @returns {Promise} Promise resolving to the vehicles data or error
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
    /**
     * Get Car By ID
     * Retrieves a single vehicle by its unique identifier
     * 
     * @param {string} carId - The unique identifier of the vehicle to retrieve
     * @returns {Promise} Promise resolving to the vehicle data or error
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
    /**
     * Get Reviews By Car ID
     * Retrieves all reviews for a specific vehicle
     * 
     * @param {string} carId - The unique identifier of the vehicle
     * @param {Object} params - Optional parameters for filtering reviews
     * @returns {Promise} Promise resolving to the reviews data or error
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
    /*fetchBookingsAtCarId
    function to get bookings at car id
    @params carId
    @returns promise
    */
    /**
     * Fetch Bookings For Car
     * Retrieves all bookings/rentals associated with a specific vehicle
     * 
     * @param {string} carId - The unique identifier of the vehicle
     * @returns {Promise} Promise resolving to the bookings data or error
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
    /**
     * Add Car
     * Creates a new vehicle listing with provided details and images
     * 
     * @param {FormData} car - FormData object containing vehicle details and images
     * @returns {Promise} Promise resolving to confirmation or error
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
    /**
     * Fetch User Cars
     * Retrieves all vehicles owned by the current user, with optional status filtering
     * 
     * @param {string} status - Optional filter for vehicle status (pending, approved, rejected)
     * @param {Object} params - Additional query parameters
     * @returns {Promise} Promise resolving to the user's vehicles or error
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
    /**
     * Get Pending Cars
     * Retrieves all vehicles with 'pending' status (for admin approval)
     * 
     * @returns {Promise} Promise resolving to pending vehicles or error
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
    /**
     * Approve Car
     * Updates a vehicle's status to 'approved' (admin function)
     * 
     * @param {string} carId - The unique identifier of the vehicle to approve
     * @returns {Promise} Promise resolving to confirmation or error
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
    /**
     * Reject Car
     * Updates a vehicle's status to 'rejected' (admin function)
     * 
     * @param {string} carId - The unique identifier of the vehicle to reject
     * @returns {Promise} Promise resolving to confirmation or error
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
    /**
     * List/Unlist Car
     * Toggles a vehicle's availability status for rental
     * 
     * @param {string} carId - The unique identifier of the vehicle
     * @returns {Promise} Promise resolving to confirmation or error
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
    /**
     * Add Review
     * Creates a new review for a vehicle after a completed rental
     * 
     * @param {string} carId - The unique identifier of the vehicle
     * @param {Object} review - Review details including rating and comments
     * @param {string} bookingId - The unique identifier of the booking
     * @returns {Promise} Promise resolving to confirmation or error
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
    /**
     * Update Car Price
     * Updates the daily rental price for a vehicle
     * 
     * @param {string} carId - The unique identifier of the vehicle
     * @param {number} price - The new daily rental price
     * @returns {Promise} Promise resolving to confirmation or error
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
    /**
     * Get Number Of Bids Per Car Location For Seller
     * Retrieves analytics data for vehicle bookings by location
     * 
     * @param {Object} params - Parameters for filtering the data (e.g., date range)
     * @returns {Promise} Promise resolving to the analytics data or error
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
    /**
     * Get Car Recommendations For User
     * Retrieves personalized vehicle recommendations based on user history
     * 
     * @returns {Promise} Promise resolving to recommended vehicles or error
     */
    this.getCarRecommendationsForUser = (params)=>{
        let deferred = $q.defer();
        $http.get(`${ApiService.baseURL}/api/bidding/getCarRecommendation`, { params:params, withCredentials: true })
        .then((res)=>{
            deferred.resolve(res.data);
        })
        .catch((error)=>{
            deferred.reject(error);
        });
        return deferred.promise;
    }
    /**
     * Add Car Category
     * Creates a new vehicle category in the system (admin function)
     * 
     * @param {Object} carCategory - Category details to add
     * @returns {Promise} Promise resolving to confirmation or error
     */
    this.addCarCategory = (carCategory)=>{
        console.log("carCategory", carCategory);    
        let deferred = $q.defer();
        $http.post(`${ApiService.baseURL}/api/admin/addCarCategory`, {name : carCategory}, { withCredentials: true })
        .then((res)=>{
            deferred.resolve(res.data);
        })
        .catch((error)=>{
            deferred.reject(error);
        });
        return deferred.promise;
    }
    this.getAllCarCategoriesForAdmin = ()=>{
        let deferred = $q.defer();
        $http.get(`${ApiService.baseURL}/api/admin/getAllCarCategories`, { withCredentials: true })
        .then((res)=>{
            deferred.resolve(res.data);
        })
        .catch((error)=>{
            deferred.reject(error);
        });
        return deferred.promise;
    }
    this.deleteCarCategory = (categoryID)=>{
        let deferred = $q.defer();
        $http.delete(`${ApiService.baseURL}/api/admin/deleteCarCategory/${categoryID}`, { withCredentials: true })
        .then((res)=>{
            deferred.resolve(res.data);
        })
        .catch((error)=>{
            deferred.reject(error);
        });
        return deferred.promise;
    }
    
});