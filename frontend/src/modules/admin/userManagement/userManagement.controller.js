angular
  .module("myApp")
  .controller(
    "userManagementCtrl",
    function ($scope, ToastService, UserService, $timeout, City, $window) {
      $scope.allUsers = []; // Collection of all loaded users
      $scope.isLoading = false; // Loading state indicator
      $scope.city = ""; // City filter
      $scope.search = ""; // Search query filter
      $scope.cities = City.getCities(); // Available cities for filtering
      $scope.userType = "seller"; // Default to showing sellers

      // Pagination configuration
      $scope.pagination = {
        currentPage: 1,
        itemsPerPage: 10,
        totalItems: 0,
        maxSize: 5,
      };
      let searchTimeout; // Reference for search timeout

      $scope.init = () => {
        fetchUsers(); // Initial fetch of users
      };

      /**
       * Sets the user type filter
       * @param {string} type - The type of users to filter (seller or buyer)
       */
      $scope.setUserType = (type) => {
        $scope.userType = type;
        $scope.pagination.currentPage = 1; // Reset to first page when changing type
        fetchUsers();
      };

      /* 
      function to fetch all the users from the database with pagination
      */
      function fetchUsers() {
        const skip =
          ($scope.pagination.currentPage - 1) * $scope.pagination.itemsPerPage;

        UserService.getAllUsers(
          $scope.city,
          $scope.search,
          skip,
          $scope.pagination.itemsPerPage,
          $scope.userType
        )
          .then((response) => {
            if (response && response.users) {
              $scope.allUsers = response.users;
              $scope.pagination.totalItems = response.pagination.total;

              // If current page is greater than total pages, reset to page 1
              const totalPages = Math.ceil(
                $scope.pagination.totalItems / $scope.pagination.itemsPerPage
              );
            }
          })
          .catch((err) => {
            ToastService.error(`Error fetching users: ${err}`);
          });
      }

      // Handle page change
      $scope.pageChanged = function () {
        fetchUsers();
      };

      // function to filter the users
      $scope.filterUsers = () => {
        $scope.pagination.currentPage = 1; // Reset to first page when filtering
        fetchUsers();
      };

      // function to reset the filter
      $scope.resetFilter = () => {
        $scope.city = "";
        $scope.search = "";
        $scope.userType = "seller"; // Reset to default of showing sellers
        $scope.pagination.currentPage = 1; // Reset to first page
        fetchUsers();
      };

      /**
       * Filters users with a delay when using the search bar
       * @returns {Promise} Promise that resolves after successful filtering or rejects with error
       */
      $scope.filterUsersWithDelay = () => {
        if (searchTimeout) {
          $timeout.cancel(searchTimeout);
        }
        searchTimeout = $timeout(() => {
          $scope.filterUsers();
        }, 300); // 300ms delay
      };

      /**
       * Blocks a user from the database and deletes all the cars of the user on the platform if they are a seller
       * @param {string} userId - The ID of the user to block
       * @returns {Promise} Promise that resolves after successful blocking or rejects with error
       */
      $scope.block = (userId) => {
        if (
          $window.confirm(
            "Are you sure you want to block this user? This action will delete all the cars of the user on the platform if they are a seller"
          )
        ) {
          $scope.isLoading = true;
          UserService.blockUser(userId)
            .then(() => {
              ToastService.success("User blocked successfully");
              fetchUsers(); // Refresh current page
            })
            .catch((err) => {
              ToastService.error(`Error blocking user: ${err}`);
            })
            .finally(() => {
              $scope.isLoading = false;
            });
        }
      };

      /**
       * Unblocks a user from the database and bring back all the cars of the user on the platform if they are a seller
       * @param {string} userId - The ID of the user to unblock
       * @returns {Promise} Promise that resolves after successful unblocking or rejects with error
       */
      $scope.unblock = (userId) => {
        $scope.isLoading = true;
        if ($window.confirm("Are you sure you want to unblock this user?")) {
          UserService.unblockUser(userId)
            .then(() => {
              ToastService.success("User unblocked successfully");
              fetchUsers(); // Refresh current page
            })
            .catch((err) => {
              ToastService.error(`Error unblocking user: ${err}`);
            })
            .finally(() => {
              $scope.isLoading = false;
            });
        }
      };
    }
  );
