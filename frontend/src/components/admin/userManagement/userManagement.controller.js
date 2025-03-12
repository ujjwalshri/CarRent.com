angular
  .module("myApp")
  .controller("userManagementCtrl", function ($scope, IDB, ToastService)  {
    $scope.allUsers = [];
    $scope.buyers = [];
    $scope.sellers = [];
    // call database function to get all the users
    $scope.users = [];
    $scope.init = () => {
      fetchUsers(); // initial fetch of users
    };

    //for fetching all the users and then filtering them into buyers and sellers
    function fetchUsers() {
      IDB.getAllUsers() 
        .then((users) => {
          $scope.blockedUsers = users.filter((user) => user.isBlocked === true); // filtering out the blocked users
          $scope.allUsers = users.filter((user) => user.isBlocked === false); // filtering out the non blocked users
          $scope.buyers = $scope.allUsers.filter((user) => {
            return user.isSeller === false; // filtering out the buyers
          });
          $scope.sellers = $scope.allUsers.filter((user) => {
            return user.isSeller === true; // filtering out the sellers
          });
        })
        .catch((err) => {
         ToastService.error(`Error fetching users ${err}`);
        });
    }
    
   
    // function to block a user and then getting all the cars of that user and then deleting all the cars of that user
    // using the async libary to do the task in a waterfall manner
    $scope.block = (userId) => { // blocking function 
      async.waterfall(    // using async.waterfall() to run the functions in a waterfall manner
        [
          function (callback) {
            IDB.blockUserByUserId(userId) // calling the db function to block the user
              .then((response) => {
               
                ToastService.success("user deleted successfully"); // showing the success message
                fetchUsers(); // fetching the users again
                callback(null, userId); // calling the next function in the waterfall
              })
              .catch((err) => {
                ToastService.error(`error blocking user ${err}`); // showing the error message
                callback(err);
              });
          },
          function (userId, callback) {
            IDB.getAllCarsByUser(userId) // calling the db function to get all the cars of the user
              .then((cars) => {
                callback(null, cars); // calling the next function in the waterfall
              })
              .catch((err) => {
                ToastService.error(`error fetching cars ${err}`); // showing the error message
                callback(err);
              });
          },
          function (cars, callback) {
            async.each(  // using async.each() to iterate over the cars and delete them parallely
              cars,
              (car, cb) => {
                IDB.rejectCar(car.id) // calling the db function to reject the car
                  .then((response) => {
                   
                    cb();
                  })
                  .catch((err) => {
                    ToastService.error(`error rejecting car ${err}`); // showing the error message
                    cb(err);
                  });
              },
              (err) => {
                if (err) {
                  ToastService.error(`error rejecting car ${err}`); // showing the error message
                  callback(err);
                } else {
                  callback(null);
                }
              }
            );
          },
        ],
        function (err) {
          if (err) {
            console.log(err);
            alert("Error in the process");
          } else {
            console.log("All cars deleted successfully");
          }
        }
      );
    };

  });
