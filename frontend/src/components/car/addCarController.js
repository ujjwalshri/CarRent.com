angular
  .module("myApp")
  .controller("addCarCtrl", function ($scope, $state, IDB, $timeout,CarFactory, ToastService, BackButton, CarService, City ) {
    $scope.back = BackButton.back; // back function to go back to the previous page
    const loggedInUser = JSON.parse(sessionStorage.getItem("user")); // getting the loggedInUser
    $scope.images = []; // This will store the selected images
    $scope.isLoading = false;
    $scope.cities = City.getCities(); // Fetch all the cities
    // Function to handle image preview and Base64 conversion

    $scope.init = function(){
      CarService.getAllCarCategoriesForAdmin().then((res)=>{
        console.log("Car categories", res);
        $scope.carCategories = res;
      })
    }

    $scope.previewImages = function (input) {
      if (input.files) {
        let files = Array.from(input.files); // Convert FileList to an array
        $scope.images = files; // Store the files directly
        console.log("Selected images:", $scope.images);
        $timeout(); // Trigger Angular digest cycle
      }
    };
    
    /*
    Function to submit the car form
    @params none
    @returns none
    */
    $scope.submitCarForm = function () {
      
      if($scope.carModel >= new Date().getFullYear()+1){
        ToastService.error("Please enter a valid car model year");
        return;
      }
      
      $scope.isLoading = true;
     console.log($scope.carName, $scope.company, $scope.carModel, $scope.category, $scope.location, $scope.carPrice, $scope.mileage, $scope.color, $scope.fuelType, $scope.city);
     
      const car = CarFactory.createCar({name: $scope.carName, company: $scope.company, modelYear: $scope.carModel, category: $scope.category, price: $scope.carPrice, mileage:  $scope.mileage, color: $scope.color,fuelType:  $scope.fuelType,city: $scope.city,vehicleImages: $scope.images});
      
      if(car instanceof Object){
        console.log(car);
        console.log("Car is valid");
      }else{
        console.log("Car is invalid", car);
        ToastService.error(car.error.map((err) => err).join(", "));
        $scope.isLoading = false;
        return;
      }

    

      const formData = car.toFormData();
       
  
      // Call the CarService to add the car
      CarService.addCar(formData)
          .then((res) => {
              console.log("Car added successfully", res);
              ToastService.success("Car added successfully");
          })
          .catch((err) => {
              console.log("Error in addCarCtrl", err);
          }).finally(() => {  
            $scope.carName = "";
            $scope.company = "";
            $scope.carModel = "";
            $scope.category = "";
            $scope.location = "";
            $scope.carPrice = "";
            $scope.mileage = "";
            $scope.color = "";
            $scope.fuelType = "";
            $scope.city = "";
            $scope.images = []; 
            $scope.isLoading = false;
          });
  }
});