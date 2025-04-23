angular
  .module("myApp")
  .controller("userManagementCtrl", function ($scope, ToastService, UserService, $timeout, City, $window)  {
    $scope.allUsers = []; // Collection of all loaded users
    $scope.isLoading = false; // Loading state indicator
    $scope.city = ""; // City filter
    $scope.search = ''; // Search query filter
    $scope.cities = City.getCities(); // Available cities for filtering

    // Pagination configuration
    $scope.pagination = {
      currentPage: 1,
      itemsPerPage: 10,
      totalItems: 0,
      maxSize: 5 // Number of page buttons to show
    };

    let searchTimeout; // Reference for search timeout

    $scope.init = () => {
      fetchUsers(); // Initial fetch of users
    };

    /* 
    function to fetch all the users from the database with pagination
    */
    function fetchUsers() {

      // Calculate skip based on current page
      const skip = ($scope.pagination.currentPage - 1) * $scope.pagination.itemsPerPage;
      
      UserService.getAllUsers($scope.city, $scope.search, skip, $scope.pagination.itemsPerPage) 
        .then((response) => {
          if (response && response.users) {
            $scope.allUsers = response.users;
            $scope.pagination.totalItems = response.pagination.total;
            
            // If current page is greater than total pages, reset to page 1
            const totalPages = Math.ceil($scope.pagination.totalItems / $scope.pagination.itemsPerPage);
            if ($scope.pagination.currentPage > totalPages) {
              $scope.pagination.currentPage = 1;
              fetchUsers();
            }
          }
        })
        .catch((err) => {
          ToastService.error(`Error fetching users: ${err}`);
        })
    }

    // Handle page change
    $scope.pageChanged = function() {
      console.log('Page changed to: ' + $scope.pagination.currentPage);
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
      $scope.pagination.currentPage = 1; // Reset to first page
      fetchUsers();
    };

    /*
    function to filter the users with a delay when using the search bar 
    */
    $scope.filterUsersWithDelay = () => {
      if (searchTimeout) {
        $timeout.cancel(searchTimeout);
      }
      
      searchTimeout = $timeout(() => {
        $scope.filterUsers(); 
      }, 300); // 300ms delay
    };

    /*
    function to block a user from the database
    */
    $scope.block = (userId) => {
      if ($window.confirm("Are you sure you want to block this user? This action will delete all the cars of the user on the platform if they are a seller")) {
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
     
    /*
    function to unblock a user from the database
    */
    $scope.unblock = (userId) => {
      $scope.isLoading = true;
      
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
    };

  });
