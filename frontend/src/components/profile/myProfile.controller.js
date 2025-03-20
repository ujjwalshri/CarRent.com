
angular.module("myApp").controller("myProfileCtrl", function($scope, $state, IDB, ToastService, $uibModal, BackButton, UserService, CarService) {

    $scope.back = BackButton.back; // back function to go back to the previous page
    $scope.isSeller = true; // setting the isSeller to true
    $scope.userCars = []; // array to hold the user cars
    $scope.deleted = false; // deleted false intially
    $scope.activeButton = 'all'; // setting the active button to all
    $scope.selectedCarPrice = { price: 0 }; // setting the selected car price to 0
    
    // function to initialize the controller
    $scope.init = () => {
        fetchUserProfile();
        fetchCars();
    };
    
   


    function fetchUserProfile(){
        UserService.getUserProfile().then((res)=>{
            $scope.user = res.data;
           
        }).catch((err)=>{
            ToastService.error("error fetching user profile");
        });
    }

   

   /*
   function to fetch all cars by a user id
    @params none
    @returns none
    */
    function fetchCars() {
        CarService.fetchUserCars("all").then((res)=>{
            console.log(res);
            $scope.userCars = res.data;
            console.log($scope.userCars);
        }).catch((err)=>{
            ToastService.error(`error fetching cars ${err}`);
        })
    }
    // function to open the price modal
    $scope.openPriceModal = (car) => {
        $scope.selectedCarId = car.id;
        $scope.selectedCarPrice.price = car.carPrice;

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
      
        IDB.updateCarPrice(carId, $scope.selectedCarPrice.price)
            .then(() => {
                ToastService.success("Car price updated successfully");
                fetchUserCars();
            })
            .catch((err) => {
                ToastService.error(`error updating the car price ${err}`);
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
        IDB.updateUser(loggedInUser.username, firstName, lastName, city, new Date()).then(() => {
            ToastService.success("User updated successfully");
            $scope.user = JSON.parse(sessionStorage.getItem("user"));
        });
    };
    // function to delete the user
    $scope.showRejected = () => {
        $scope.activeButton = 'rejected';
        CarService.fetchUserCars("rejected").then(res=>{
            $scope.userCars =  res.data;
            console.log($scope.userCars);
        }).catch(err=>{
            ToastService.error(`error fetching cars ${err}`);
        })
    };
    
    $scope.showApproved = () => {
        $scope.activeButton = 'approved';
         CarService.fetchUserCars("approved").then(res=>{
            $scope.userCars =  res.data;
            console.log($scope.userCars);
        }).catch(err=>{
            ToastService.error(`error fetching cars ${err}`);
        })
    };
    $scope.showAll = () => {
        $scope.activeButton = 'all';
        fetchCars();
    };


    $scope.deleteCar = (carID) => {
        IDB.toggleUserCars(carID, true).then(() => {
            ToastService.success("car deleted successfully");
            $scope.deleted = true;
            fetchUserCars();
        }).catch((err) => {
            ToastService.error(`error deleting the car ${err}`);
        });
    };

    $scope.listCar = (carId) => {
        IDB.toggleUserCars(carId, false).then(() => {
            ToastService.success("Car listed successfully");
            fetchUserCars();
        }).catch((err) => {
            ToastService.error(`error listing the car ${err}`);
        });
    };

    $scope.redirectToCarPage = (carID) => {
        $state.go("singleCar", { id: carID });
    };
});