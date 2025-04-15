angular
  .module("myApp")
  .controller("addCarCtrl", function ($scope, $timeout,CarFactory, ToastService, CarService, City ) {
    // Array to store the car images selected by the user
    $scope.images = []; 
    // Flag to track loading state during form submission
    $scope.isLoading = false;
    // Get available cities from the City service
    $scope.cities = City.getCities(); 

    $scope.companies = CarFactory.companies;
    $scope.fuelTypes = CarFactory.fuelTypes;
    $scope.locations = CarFactory.locationTypes;

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
     * Handle image file selection and prepare for upload creates the dominant color of the car from the car images to use in the car card
     * @param {Object} input - The file input DOM element 
     */
    $scope.previewImages = function (input) {
      if (input.files) {
        let files = Array.from(input.files);
      

        // Validation: Max 5 files
        if (files.length > 5 ) {
          $scope.imageError = 'You can only upload 1 to 5 images';
          input.value = '';
          $scope.images = [];
          $scope.imagePreviews = [];
          $scope.imageColor = null;
          $timeout();
          return;
        }
    
        // Validation: Allowed types
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));
    
        if (invalidFiles.length > 0) {
          $scope.imageError = 'Only JPG, JPEG, PNG and WebP images are allowed';
          input.value = '';
          $scope.images = [];
          $scope.imagePreviews = [];
          $scope.imageColor = null;
          $timeout();
          return;
        }
    
        // Validation: File size < 5MB
        const maxSize = 5 * 1024 * 1024;
        const oversizedFiles = files.filter(file => file.size > maxSize);
    
        if (oversizedFiles.length > 0) {
          $scope.imageError = 'Each image must be less than 5MB';
          input.value = '';
          $scope.images = [];
          $scope.imagePreviews = [];
          $scope.imageColor = null;
          $timeout();
          return;
        }
    
        // Clear errors and initialize
        $scope.imageError = null;
        $scope.images = files;
        $scope.imagePreviews = [];
        $scope.imageColor = null;
    
        // Handle image previews
        files.forEach((file, index) => {
          const reader = new FileReader();
          reader.onload = function (e) {
              $scope.imagePreviews[index] = e.target.result;
              
            // calculating the color from the first image
            if (index === 0) {
              const img = new Image();
              img.crossOrigin = 'anonymous';
              img.src = e.target.result;
    
              img.onload = function () {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
    
                canvas.width = img.naturalWidth;  // Set the width of the canvas to the natural width of the image
                canvas.height = img.naturalHeight; // Set the height of the canvas to the natural height of the image
    
                ctx.drawImage(img, 0, 0); // Draw the image on the canvas
                const centerX = Math.floor(canvas.width / 2); // Calculate the center of the canvas
                const centerY = Math.floor(canvas.height / 2); // Calculate the center of the canvas
                const pixelData = ctx.getImageData(centerX, centerY, 1, 1).data; // Get the pixel data of the center of the image
                $scope.color = rgbToHex(pixelData[0], pixelData[1], pixelData[2]); // Convert the pixel data to a hex color
                $timeout();
              };
            }
          };
    
          reader.readAsDataURL(file);
        });
    
        $timeout(); // Trigger digest
      }
    };
    
    // Utility: RGB to HEX
    function rgbToHex(r, g, b) {
      return "#" + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      }).join('');
    }
    
    
    /**
     * Submit the car form and create a new car listing
     * Validates inputs, creates a car object, and sends to server
     */
    $scope.submitCarForm = function () {

     if($scope.images.length < 1) {
        ToastService.error('Please select at least one image');
        return;
      }
     
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
        location: $scope.location,
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