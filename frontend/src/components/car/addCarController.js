angular
  .module("myApp")
  .controller("addCarCtrl", function ($scope, $state, IDB, $timeout,carValidation, ToastService, BackButton, CarService ) {
    $scope.back = BackButton.back; // back function to go back to the previous page
    const loggedInUser = JSON.parse(sessionStorage.getItem("user")); // getting the loggedInUser
    $scope.images = []; // This will store the selected images
    $scope.isLoading = false;
    // Function to handle image preview and Base64 conversion
    $scope.previewImages = function (input) {
      if (input.files) {
        let files = Array.from(input.files); // Convert FileList to an array
        $scope.images = files; // Store the files directly
        console.log("Selected images:", $scope.images);
        $timeout(); // Trigger Angular digest cycle
      }
    };



    
    // Submit form function
    $scope.submitCarForm = function () {
      $scope.isLoading = true;
      const formData = new FormData();
     console.log($scope.carName, $scope.company, $scope.carModel, $scope.category, $scope.location, $scope.carPrice, $scope.mileage, $scope.color, $scope.fuelType, $scope.city);

      formData.append('name', $scope.carName);
      formData.append('company', $scope.company);
      formData.append('modelYear', $scope.carModel);
      formData.append('category', $scope.category);
      formData.append('location', $scope.location);
      formData.append('price', $scope.carPrice);
      formData.append('mileage', $scope.mileage);
      formData.append('color', $scope.color);
      formData.append('fuelType', $scope.fuelType);
      formData.append('city', $scope.city);
  

      if ($scope.images && $scope.images.length > 0) {
          $scope.images.forEach((image, index) => {
            formData.append(`images`, image); 
          });
      }
  
     
  
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }
      
    

  
      // Call the CarService to add the car
      CarService.addCar(formData)
          .then((res) => {
              console.log("Car added successfully", res);
              $scope.isLoading = false;
              ToastService.success("Car added successfully");
              $state.go("profile");
          })
          .catch((err) => {
              console.log("Error in addCarCtrl", err);
          });
  }
});