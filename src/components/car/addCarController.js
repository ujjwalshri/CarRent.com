angular
  .module("myApp")
  .controller("addCarCtrl", function ($scope, $state, IDB, $timeout,carValidation, ToastService, BackButton ) {
    $scope.back = BackButton.back; // back function to go back to the previous page
    const loggedInUser = JSON.parse(sessionStorage.getItem("user")); // getting the loggedInUser
    $scope.images = []; // This will store the selected images
    // Function to handle image preview and Base64 conversion
    $scope.previewImages = function (input) {
      if (input.files) {
        let files = Array.from(input.files); // Convert FileList to an array
        let totalFiles = files.length;
        let processedFiles = 0;
    
        files.forEach((file) => {
          let reader = new FileReader();
          reader.readAsDataURL(file); // converts file into the base64 string
          
          reader.onload = function (e) {
         
            $scope.images.push({ file: file, base64: e.target.result }); // pushing the base64 converted images 
            processedFiles++;
  
            console.log("Image added:", file.name);
            
            if (processedFiles === totalFiles) {
              console.log("All images processed:", $scope.images);
            }
    
            // using timeout for no delay to the angualrr digest cycle
            $timeout();
          };
        });
      }
    };
    
    // Submit form function
    $scope.submitCarForm = function () {

      // Car object to be added to the database
      const car = {
        carType: $scope.carType,
        carName: $scope.carName,
        carModel: $scope.carModel,
        category: $scope.category,
        location: $scope.location,
        isApproved: "pending",
        owner: {
          id: loggedInUser.id,
          username: loggedInUser.username,
          firstName: loggedInUser.firstName,
          lastName: loggedInUser.lastName,
          email: loggedInUser.email,
          adhaar: loggedInUser.adhaar,
          city: loggedInUser.city,
          isBlocked: loggedInUser.isBlocked
        },
        carPrice: $scope.carPrice,
        mileage: $scope.mileage,
        vehicleImages: [], // This will store the base64 images
        features: {
          GPS: $scope.GPS,
          Sunroof: $scope.Sunroof,
          Bluetooth: $scope.Bluetooth,
          RearCamera: $scope.RearCamera,
          HeatedSeats: $scope.HeatedSeats,
        },
        deleted:false,
        createdAt: new Date(),
      };
    
    
      // adding the base64 strings from the images to the car object's vehicleImages array
      car.vehicleImages = $scope.images.map((image) => image.base64);

      // validate the car schema for the car object properties
      if (!carValidation.validateCarSchema(car)) {v
        ToastService.error("please fill all the required fields");
        return;
      }
      // validating the car object details
      if(!carValidation.validateCar(car).success){
        ToastService.error(`invalid car details ${carValidation.validateCar(car).message}`);
        return;
      }

      // Add the car to the database
      IDB.addCar(car)
        .then((response) => {
          ToastService.success(`car added successfully`); // Success message
          return IDB.makeUserSeller(loggedInUser.id); // Returns the next promise
        })
        .then((response) => {
          $state.go("home"); // Redirect to the home page
        })
        .catch((error) => {
          ToastService.error(`error adding car ${error}`); // Error message
        });
    };
  });
