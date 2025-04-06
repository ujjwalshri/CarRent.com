angular
  .module("myApp")
  .controller("userManagementCtrl", function ($scope, ToastService, UserService, $timeout, City, $window)  {
    $scope.allUsers = []; // Collection of all loaded users
    $scope.isLoading = false; // Loading state indicator
    $scope.city = ""; // City filter
    $scope.search = ''; // Search query filter
    $scope.cities = City.getCities(); // Available cities for filtering
    $scope.skip = 0; // Number of records to skip (for pagination)
    $scope.limit = 10; // Number of records per page
    $scope.hasMoreUsers = true; // Flag indicating if more users are available
    let searchTimeout; // Reference for search timeout
    $scope.users = []; // array to hold the users


    $scope.init = () => {
      fetchUsers(true); // Initial fetch of users (reset=true)
    };

     /* 
     function to fetch all the users from the database
      @params none
      @returns none
     */
    function fetchUsers(reset = false) {
      // Set loading state
      $scope.isLoading = true;
      
      // If reset is true, clear existing users and reset pagination
      if (reset) {
        $scope.allUsers = [];
        $scope.skip = 0;
      }
      
      // Fetch users with current filters and pagination
      UserService.getAllUsers($scope.city, $scope.search, $scope.skip, $scope.limit) 
        .then((response) => {
          // If reset, replace users, otherwise append to existing list
          if (reset) {
            $scope.allUsers = response.users;
          } else {
            $scope.allUsers = $scope.allUsers.concat(response.users);
          }
          
          // Determine if more users are available
          $scope.hasMoreUsers = response.users.length >= $scope.limit;
          console.log("Users loaded:", $scope.allUsers.length, "Has more:", $scope.hasMoreUsers);
        })
        .catch((err) => {
          ToastService.error(`Error fetching users: ${err}`);
        })
        .finally(() => {
          // Reset loading state
          $scope.isLoading = false;
        });
    }
    // function to filter the users
    $scope.filterUsers = () => {
      fetchUsers(true); // Reset user list and fetch with new filters
    };

    // function to reset the filter
    $scope.resetFilter = () => {
      // Clear all filter criteria
      $scope.city = "";
      $scope.search = "";
      
      // Fetch users with cleared filters
      fetchUsers(true);
    };

    /*
    function to filter the users with a delay when using the search bar 
      @params none
      @returns none
    */
    $scope.filterUsersWithDelay = () => {
      // Cancel any pending search
      if (searchTimeout) {
        $timeout.cancel(searchTimeout);
      }
      
      // Create new timeout for search
      searchTimeout = $timeout(() => {
        $scope.filterUsers(); 
      }, 300); // 300ms delay
    };

    
    /*
    function to block a user from the database, and the delete all the cars of the user on the platform
      @params userId
      @returns none
    */
    $scope.block = (userId) => {
      // Show loading indicator
      $scope.isLoading = true;
     if( $window.confirm("Are you sure you want to block this user? this action will delete all the cars of the user on the platform if he is seller")){
      UserService.blockUser(userId)
      .then(() => {
        ToastService.success("User blocked successfully");
        // Refresh current page of users
        fetchUsers(true);
      })
      .catch((err) => {
        ToastService.error(`Error blocking user: ${err}`);
      })
      .finally(() => {
        $scope.isLoading = false;
      });
  };
     }
     
    /*
    function to unblock a user from the database, and the bring back all the cars of the user on the platform
      @params userId
      @returns none
    */
    $scope.unblock = (userId) => {
      // Show loading indicator
      $scope.isLoading = true;
      
      UserService.unblockUser(userId)
        .then(() => {
          ToastService.success("User unblocked successfully");
          // Refresh current page of users
          fetchUsers(true);
        })
        .catch((err) => {
          ToastService.error(`Error unblocking user: ${err}`);
        })
        .finally(() => {
          $scope.isLoading = false;
        });
    };

   /*
    function to set the city filter
    @params city
    @returns none
   */
    $scope.setCity = (city) => {
      $scope.city = city;
      fetchUsers(true); // Reset user list and fetch with new city filter
    };

    /*
    function to load more users
    @params none
    @returns none
    */
    $scope.loadMore = () => {
      // Only proceed if not currently loading and more users are available
      if (!$scope.isLoading && $scope.hasMoreUsers) {
        // Increase skip value to fetch next page
        $scope.skip += $scope.limit;
        // Fetch next page and append to existing list
        fetchUsers(false);
      }
    };

  });
