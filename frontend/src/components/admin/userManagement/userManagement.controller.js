angular
  .module("myApp")
  .controller("userManagementCtrl", function ($scope, IDB, ToastService, UserService, $timeout)  {
    $scope.allUsers = []; // array to hold all the users
    $scope.city = ""; // variable to hold the city
    $scope.search = ''; // variable to hold the search query
    let searchTimeout; // variable to hold the search timeout
    $scope.users = []; // array to hold the users

 
    
    $scope.init = () => {
      fetchUsers(); // initial fetch of users
    };

     /* 
     function to fetch all the users from the database
      @params none
      @returns none
     */
    function fetchUsers() {
      UserService.getAllUsers($scope.city, $scope.search) 
        .then((users) => {
          $scope.allUsers = users.users;
          console.log($scope.allUsers);
        })
        .catch((err) => {
         ToastService.error(`Error fetching users ${err}`);
        });
    }
    // function to filter the users
    $scope.filterUsers = ()=>{
      fetchUsers();
    }

    // function to reset the filter
    $scope.resetFilter = ()=>{
      $scope.city = "";
      fetchUsers();
    }

    /*
    function to filter the users with a delay when using the search bar 
      @params none
      @returns none
    */
    $scope.filterUsersWithDelay = () => {
      if (searchTimeout) {
          $timeout.cancel(searchTimeout); 
      }
  
      searchTimeout = $timeout(() => {
          $scope.filterUsers(); 
      }, 200);
  };

    
    /*
    function to block a user from the database, and the delete all the cars of the user on the platform
      @params userId
      @returns none
    */
    $scope.block = (userId) => { // blocking function 
      UserService.blockUser(userId)
        .then(() => {
          ToastService.success("User blocked successfully");
          fetchUsers();
        })
        .catch((err) => {
          ToastService.error(`Error blocking user ${err}`);
        });
    }
    /*
    function to unblock a user from the database, and the bring back all the cars of the user on the platform
      @params userId
      @returns none
    */
    $scope.unblock = (userId) => { // unblocking function
      UserService.unblockUser(userId)
        .then(() => {
          ToastService.success("User unblocked successfully");
          fetchUsers();
        })
        .catch((err) => {
          ToastService.error(`Error unblocking user ${err}`);
        });
    }

  });
