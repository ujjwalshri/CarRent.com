angular
  .module("myApp")
  .controller("addCarCtrl", function ($scope, $state, IDB, $timeout,CarFactory, ToastService, BackButton, CarService, City ) {
    // Array to store the car images selected by the user
    $scope.images = []; 
    // Flag to track loading state during form submission
    $scope.isLoading = false;
    // Get available cities from the City service
    $scope.cities = City.getCities(); 
    // Get current year for model year validation
    $scope.currentYear = new Date().getFullYear();

    /**
     * Initialize the controller by fetching car categories
     */
    $scope.init = function(){
      CarService.getAllCarCategoriesForAdmin().then((res)=>{
        $scope.carCategories = res;
      })
    }

    /**
     * Handle image file selection and prepare for upload
     * @param {Object} input - The file input DOM element
     */
    $scope.previewImages = function (input) {
      if (input.files) {
        let files = Array.from(input.files); // Convert FileList to an array
        
        // Check if more than 5 files are selected
        if (files.length > 5) {
          $scope.imageError = 'You can only upload up to 5 images';
          input.value = ''; // Clear the file input
          $scope.images = []; // Clear any previously selected images
          $timeout(); // Trigger Angular digest cycle
          return;
        }

        // Define allowed file types
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        
        // Check each file's type
        const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));
        
        if (invalidFiles.length > 0) {
          $scope.imageError = 'Only JPG, JPEG, PNG and WebP images are allowed';
          input.value = ''; // Clear the file input
          $scope.images = []; // Clear any previously selected images
          $timeout(); // Trigger Angular digest cycle
          return;
        }

        // Check file size (max 5MB per file)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        const oversizedFiles = files.filter(file => file.size > maxSize);

        if (oversizedFiles.length > 0) {
          $scope.imageError = 'Each image must be less than 5MB';
          input.value = ''; // Clear the file input
          $scope.images = []; // Clear any previously selected images
          $timeout(); // Trigger Angular digest cycle
          return;
        }
        
        // Clear any previous error
        $scope.imageError = null;
        $scope.images = files;
        console.log("Selected images:", $scope.images);
        $timeout(); // Trigger Angular digest cycle
      }
    };
    
    /**
     * Submit the car form and create a new car listing
     * Validates inputs, creates a car object, and sends to server
     */
    $scope.submitCarForm = function () {
      $scope.isLoading = true;
     console.log($scope.carName, $scope.company, $scope.carModel, $scope.category, $scope.location, $scope.carPrice, $scope.mileage, $scope.color, $scope.fuelType, $scope.city);
     
      // Create a car object using the factory with form field values
      const car = CarFactory.createCar({
        name: $scope.carName, 
        company: $scope.company, 
        modelYear: $scope.carModel, 
        category: $scope.category, 
        price: $scope.carPrice, 
        mileage: $scope.mileage, 
        color: $scope.color,
        fuelType: $scope.fuelType,
        city: $scope.city,
        vehicleImages: $scope.images
      });
      
      // Validate the car object
      if(typeof car === 'String'){
        ToastService.error(car);
        $scope.isLoading = false;
        return;
      }

      // Convert car data to FormData for multipart/form-data submission (for images)
      const formData = car.toFormData();
      
      // Send the car data to the server
      CarService.addCar(formData)
          .then((res) => {
              console.log("Car added successfully", res);
              ToastService.success("Car added successfully");
          })
          .catch((err) => {
              ToastService.error(`Error adding car: ${err}`);
          }).finally(() => {  
            // Reset form fields after submission (success or failure)
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