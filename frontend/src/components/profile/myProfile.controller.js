angular.module("myApp").controller("myProfileCtrl", function($scope, $state, IDB, ToastService, $uibModal, BackButton, UserService, CarService, BiddingService) {

    $scope.back = BackButton.back; // back function to go back to the previous page
    $scope.isSeller = true; // setting the isSeller to true
    $scope.userCars = []; // array to hold the user cars
    $scope.deleted = false; // deleted false intially
    $scope.activeButton = 'all'; // setting the active button to all
    $scope.selectedCarPrice = { price: 0 }; // setting the selected car price to 0
    $scope.skip = 0; // setting the skip to 0
    $scope.limit = 5; // setting the limit to 5
    $scope.hasMoreCars = true; // setting the hasMoreCars to true
    $scope.status; // setting the status to undefined

    
    /*
    function to initialize the controller
    @params none
    @returns none
    */
    $scope.init = () => {
        fetchUserProfile();
        fetchCars();
    };
    /*
    function to get profile of the user
    @params none
    @returns none
    */
    function fetchUserProfile(){
        UserService.getUserProfile().then((res)=>{
            $scope.user = res.data;
            
            console.log($scope.user);
            $scope.updatedUser = $scope.user;
        }).catch((err)=>{
            ToastService.error("error fetching user profile");
        });
    }
    
    /*
    function to navigate to the car page
    @params none
    @returns none
    */
    $scope.navigate = ()=>{
        $state.go('car');
    }
    /*
    function to loadMore Cars and add them
    @params none
    @returns 
    */
    $scope.loadMore =()=>{
        $scope.skip = $scope.skip + $scope.limit;
        fetchCars($scope.status);
    }

    /*
    function to refresh the page
    @params none
    @returns none
    */
    $scope.reset = ()=>{
        $state.reload();
    }

   /*
   function to fetch all cars by a user id
    @params none
    @returns none
    */
    function fetchCars(status) {
        const params = {
            skip : $scope.skip,
            limit: $scope.limit
        }
        console.log(params);
        CarService.fetchUserCars(status ? status : 'all', params).then((res)=>{
            console.log(res);
            $scope.skip==0 ? $scope.userCars = res.data : $scope.userCars = $scope.userCars.concat(res.data); 
            
            $scope.hasMoreCars = res.data.length > 0;
            console.log($scope.userCars);
        }).catch((err)=>{
            ToastService.error(`error fetching cars ${err}`);
        })
    }
    /*
    function to open the price modal
    @params car
    @returns none
    */
    $scope.openPriceModal = (car) => {
        console.log(car);
        $scope.selectedCarId = car._id;
        $scope.selectedCarPrice.price = car.price;
        $uibModal.open({
            templateUrl: 'priceModal.html',
            scope: $scope
        });
    };

    
   // function to update the price of the car
    $scope.updatePrice = () => {
        const carId = $scope.selectedCarId;
        console.log($scope.selectedCarPrice.price);
        const carPrice = $scope.selectedCarPrice.price;
        console.log(carPrice);  
        console.log(carId);
        console.log($scope.selectedCarPrice.price);
      
        CarService.updateCarPrice(carId, $scope.selectedCarPrice.price)
            .then(() => {
                ToastService.success("Car price updated successfully");
                fetchCars();
            })
            .catch((err) => {
                console.log(err);
                ToastService.error(`error updating the car price ${err.data.message}`);
            });
    };
    // function to open the update modal
    $scope.openUpdateModal = () => {
        $uibModal.open({
            templateUrl: 'updateUserModal.html',
            scope: $scope
        });
    };
    // function to open the delete modal
    $scope.updateUser = () => {
        if (new Date() - new Date($scope.user.updatedAt) <= 3 * 24 * 60 * 60 * 1000) {
            ToastService.error("You can only update your profile once every 3 days");
            return;
        }
        const { firstName, lastName, city } = $scope.updatedUser;
        console.log(firstName, lastName, city);
        const data = {
            firstName,
            lastName,
            city
        }
        UserService.updateUserProfile(data).then((user) => {
            console.log(user);
            ToastService.success("User profile updated successfully");
            $scope.user = user.data.user;
        }).catch((err) => {
            ToastService.error(`error updating user profile ${err}`);
        });
    };
    // function to delete the user
    $scope.showRejected = () => {
        $scope.activeButton = 'rejected';
        $scope.status = 'rejected';
       fetchCars("rejected");
    };
    // function to show the approved cars
    $scope.showApproved = () => {
        $scope.activeButton = 'approved';
        $scope.status = 'approved';
        fetchCars("approved");
    };

    // function to show all the cars
    $scope.showAll = () => {
        $scope.activeButton = 'all';
        $scope.status = 'all';
        fetchCars('all');
    };

    $scope.redirectToCarPage = (carID) => {
        $state.go("singleCar", { id: carID });
    };

    $scope.viewCarBookings = function(car) {
        var modalInstance = $uibModal.open({
            templateUrl: 'components/profile/bookingsModal.html',
            controller: 'BookingsModalCtrl',
            resolve: {
                selectedCar: function() {
                    return car;
                }
            }
        });
    };
});