angular
  .module("myApp")
  .controller("carCtrl", function ($scope, ToastService, CarService, $q) {
    $scope.carCategories = []; // array to store the car categories
    $scope.carCategory = ""; // string to store the car category
    $scope.isLoading = false;
    $scope.priceRange = { min: 0, max: 0 }; // object to store the price range
    $scope.platformCharge = { percentage: 0, gst: 0 }; // object to store the platform charge percentage
    $scope.activeTab = "generalSettings"; // Add active tab tracking

    // Make Math available to the scope for pagination calculations
    $scope.Math = window.Math;

    // Pagination configuration for car approvals
    $scope.pagination = {
      currentPage: 1,
      itemsPerPage: 5,
      totalItems: 0,
      maxSize: 5, // Number of page buttons to show
    };

    /*
    function to initialize the car controller
    @params none
    @returns none
   */
    $scope.init = () => {
      fetchCarManagementData();
    };

    /**
     * Changes the active tab
     * @param {string} tabName - Name of tab to activate
     */
    $scope.setActiveTab = function (tabName) {
      $scope.activeTab = tabName;

      // Reset pagination when switching to car approvals tab
      if (tabName === "carApproval" && $scope.pagination.currentPage !== 1) {
        $scope.pagination.currentPage = 1;
        fetchPendingCars();
      }
    };

    /**
     * Fetches pending cars with pagination
     * @returns {void}
     */
    function fetchPendingCars() {
      $scope.isLoading = true;

      const params = {
        page: $scope.pagination.currentPage,
        limit: $scope.pagination.itemsPerPage,
      };

      CarService.getPendingCars(params)
        .then((response) => {
          // Handle the new response format that includes cars array and pagination metadata
          if (response.cars && Array.isArray(response.cars)) {
            $scope.cars = response.cars;

            // Set pagination data from the response
            if (response.pagination) {
              $scope.pagination.totalItems = response.pagination.total;
            }
          } else {
            // Fallback for backward compatibility
            $scope.cars = response;

            // Estimate total items if we don't have exact count
            if (response.length < $scope.pagination.itemsPerPage) {
              $scope.pagination.totalItems =
                ($scope.pagination.currentPage - 1) *
                  $scope.pagination.itemsPerPage +
                response.length;
            } else {
              $scope.pagination.totalItems = Math.max(
                $scope.pagination.totalItems,
                $scope.pagination.currentPage * $scope.pagination.itemsPerPage
              );
            }
          }
        })
        .catch((err) => {
          ToastService.error("Error fetching pending cars: " + err);
        })
        .finally(() => {
          $scope.isLoading = false;
        });
    }

    /**
     * Handle page change event from pagination control
     */
    $scope.pageChanged = function () {
      fetchPendingCars();
    };

    /**
     * Fetches car management data from the database
     * @returns {void}
     */
    function fetchCarManagementData() {
      $scope.isLoading = true;
      $q.all([
        fetchPendingCars(), // Use the dedicated function for pending cars
        CarService.getAllCarCategoriesForAdmin(),
        CarService.getCurrentPriceRanges(),
        CarService.getCharges(),
      ])
        .then(([_, carCategories, priceRanges, charges]) => {
          $scope.carCategories = carCategories;
          $scope.priceRange = priceRanges[0];
          $scope.platformCharge.percentage = charges[0].percentage;
        })
        .catch((err) => {
          ToastService.error("Error fetching platform management data" + err);
        })
        .finally(() => {
          $scope.isLoading = false;
        });
    }

    /**
     * Saves the platform charge percentage
     * @returns {void}
     */
    $scope.savePlatformCharge = (chargeName) => {
      CarService.updateCharges({
        charge: chargeName,
        percentage:
             $scope.platformCharge.percentage
      })
        .then(() => {
          ToastService.success("Platform charge updated successfully");
          fetchCarManagementData();
        })
        .catch((err) => {
          ToastService.error("Error updating platform charge");
        });
    };

    /**
     * Adds a car category to the database
     * @returns {void}
     */
    $scope.addCarCategory = () => {
      if (
        $scope.carCategory.trim() === "" ||
        $scope.carCategory.trim().length < 3
      ) {
        ToastService.error(
          "Car category cannot be empty or less than 3 characters"
        );
        return;
      }

      CarService.addCarCategory($scope.carCategory)
        .then((category) => {
          ToastService.success("Car category added successfully");
          fetchCarManagementData();
        })
        .catch((err) => {
          ToastService.error("Error adding car category");
        })
        .finally(() => {
          $scope.carCategory = "";
        });
    };

    /**
     * Adds a price range to the database
     * @returns {void}
     */
    $scope.addPriceRange = () => {
      CarService.updateCarPriceRange($scope.priceRange)
        .then((priceRange) => {
          ToastService.success("Price range added successfully");
          fetchCarManagementData();
        })
        .catch((err) => {
          ToastService.error("Error adding price range");
        })
        .finally(() => {
          $scope.priceRange = "";
        });
    };

    /**
     * Deletes a car category from the database
     * @param {string} categoryID - ID of the car category to delete
     * @returns {void}
     */

    $scope.deleteCarCategory = (categoryID) => {
      console.log(categoryID);
      CarService.deleteCarCategory(categoryID)
        .then(() => {
          ToastService.success("Car category deleted successfully");
          fetchCarManagementData();
        })
        .catch((err) => {
          ToastService.error("Error deleting car category");
        });
    };

    /**
     * Approves a car from the database
     * @param {string} carID - ID of the car to approve
     * @returns {void}
     */
    $scope.approveCar = (carID) => {
      CarService.approveCar(carID)
        .then(() => {
          ToastService.success("Car approved successfully");
          fetchCarManagementData();
        })
        .catch((err) => {
          ToastService.error(`Error approving car ${err}`);
        });
    };

    /**
     * Rejects a car from the database
     * @param {string} carID - ID of the car to reject
     * @returns {void}
     */
    $scope.rejectCar = (carID) => {
      CarService.rejectCar(carID)
        .then(() => {
          ToastService.success("Car rejected successfully");
          fetchCarManagementData();
        })
        .catch((err) => {
          ToastService.error(`Error rejecting car ${err}`);
        });
    };

  });
