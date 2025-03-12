angular
  .module("myApp")
  .controller("analyticsCtrl", function ($scope, $q, IDB, Booking, ToastService,ChartService) {
    $scope.init = () => {
      // Fetch all users
      $scope.calculateBookingPrice = Booking.calculate; // function to calculate the booking price from the booking factory
      $scope.months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ]; // array of months
      $scope.monthlyBookings = []; // monthly bookings as empty in the start
      $scope.carAndBiddingsMap = {}; // map to store the cars and the bidding on those
      $scope.ownerAndAddedCarsMap = {}; // map to store the owner and their added cars on the platform
      $scope.carAndReviewsMap = {}; // map to store the cars and their reviews
      $scope.numberOfUsersPerCity = {}; // map to store the number of users per city
      $scope.numberOfBookingsPerCar = {}; // map to store the number of bookings per car
      $scope.carAndAverageRatingMap = {};// map to store the average rating of the cars

      fetchChartsData();
    };

    /*
     Function to fetch all the data for the charts
    */
    function fetchChartsData() {
      $q.all([
        IDB.getAllUsers(), // fetch all the users
        IDB.getApprovedCars(), // fetch all the approved cars
        IDB.getAllBookings(), // fetch all the bookings
        IDB.getAllReviews(), // fetch all the reviews
      ])
        .then((results) => {
          calculateChartData(results); // calculate the chart data
          loadAllCharts(); // load all the charts
        })
        .catch((err) => {
          ToastService.error(`error fetching the chart data ${err}`);
        });
    }
     
    /*
    Function to calculate the data for the charts
    @params {array} results - array of all the results fetched from the database which is all the data from the database called parallely
    @returns none
    */
    function calculateChartData(results) {
      $scope.allUsers = results[0]; // all users
      console.log($scope.allUsers);
      $scope.sellers = $scope.allUsers.filter(
        (user) => user.isSeller === true && user.isBlocked === false
      ); // all sellers
      $scope.buyers = $scope.allUsers.filter(
        (user) => user.isSeller === false && user.isBlocked === false
      ); // all buyers
      console.log($scope.sellers);
      console.log($scope.buyers);
      $scope.blocked = $scope.allUsers.filter(
        (user) => user.isBlocked === true
      ); // all blocked users
      $scope.numberOfUsersPerCity = $scope.allUsers.reduce((acc, user) => {
        // number of users per city
        
          
        if (acc[user.city]) {
          acc[user.city] += 1;
        } else {
          acc[user.city] = 1;
        }
        return acc;
      
      }, {});
      $scope.allCars = results[1]; // all cars
      console.log($scope.allCars);
      $scope.approvedCars = $scope.allCars.filter(
        (car) => car.isApproved === "approved"
      ); // all approved cars

     
      $scope.deletedCars = $scope.allCars.filter((car) => car.deleted === true ); // all deleted cars
      $scope.suvCars = $scope.allCars.filter(
        (car) => car.category === "SUV" && car.deleted === false && car.isApproved === "approved"
      ); // all suv cars and not deleted
      $scope.sedanCars = $scope.allCars.filter(
        (car) => car.category === "Sedan" && car.deleted === false && car.isApproved === "approved"
      ); // all sedan cars and not deleted
      $scope.ownerAndAddedCarsMap = $scope.allCars.reduce((acc, car) => {
        // number of cars added by owners on the platform
        if (acc[car.owner.username]) {
          acc[car.owner.username] += 1;
        } else {
          acc[car.owner.username] = 1;
        }
        return acc;
      }, {});

      $scope.AllBookings = results[2]; // all bookings
      $scope.confirmedBookings = $scope.AllBookings.filter(
        (booking) => booking.status === "approved" || booking.status === "reviewed"
      ); // all confirmed bookings
      $scope.endedBookings = $scope.AllBookings.filter(
        (booking) => booking.ended === true
      ); // all ended bookings
      $scope.calculatedBiddingConversionRate = Math.ceil(
        ($scope.confirmedBookings.length / $scope.AllBookings.length) * 100
      ); // bidding conversion rate calculation
      

      // not i will fetch the boookings with the start month equal to the array of months at that particular month value in the array

      $scope.months.forEach((month, index) => {
        $scope.monthlyBookings[index] = $scope.AllBookings.filter(
          (booking) => new Date(booking.startDate).getMonth() === index
        ); // filter the bookings with the start month equal to the month value in the array
      });
      // populating the numberOfBookingsPerCar map with the number of bookings per car
      $scope.confirmedBookings.forEach((booking) => {
        if (
          $scope.numberOfBookingsPerCar[
            booking.vehicle.carName + " " + booking.vehicle.carModel
          ]
        ) {
          $scope.numberOfBookingsPerCar[
            booking.vehicle.carName + " " + booking.vehicle.carModel
          ] += 1;
        } else {
          $scope.numberOfBookingsPerCar[
            booking.vehicle.carName + " " + booking.vehicle.carModel
          ] = 1;
        }
      });

      // calculating the average booking duration of the cars
      const bookedDays = $scope.confirmedBookings.reduce((acc, booking) => {
        const startDate = new Date(booking.startDate);
        const endDate = new Date(booking.endDate);
        const duration = Math.abs(endDate - startDate) / (1000 * 60 * 60 * 24); // duration in days
        acc += duration; // sum of all the durations
        return acc; // returing sum of all durations
      }, 0);
    
      $scope.averageBookingDuration =
        $scope.confirmedBookings.length > 0
          ? Math.ceil(bookedDays / $scope.confirmedBookings.length)+1
          : 0; // average booking duration calculation

      // sort the bookings of the car in sorted order
      $scope.numberOfBookingsPerCar = Object.entries(
        $scope.numberOfBookingsPerCar
      ).sort((a, b) => a[1] - b[1]);
      $scope.ownerAndAddedCarsMap = Object.entries(
        $scope.ownerAndAddedCarsMap
      ).sort((a, b) => b[1] - a[1]); // sort the ownerAndAddedCarsMap on the basis of the number of cars

      $scope.reviews = results[3]; // geting all the reviews
      $scope.reviews.forEach((review) => {
        // looping through the reviews
        if (
          review.car.carName === undefined ||
          review.car.carModel === undefined
        ) {
          return;
        }
        if (
          $scope.carAndReviewsMap[
            review.car.carName + " " + review.car.carModel
          ]
        ) {
          // if the car is already in the map
          $scope.carAndReviewsMap[
            review.car.carName + " " + review.car.carModel
          ] += 1;
        } else {
          // if the car is not in the map
          $scope.carAndReviewsMap[
            review.car.carName + " " + review.car.carModel
          ] = 1;
        }
      });

      $scope.carAndReviewsMap = Object.entries($scope.carAndReviewsMap).sort(
        (a, b) => b[1] - a[1]
      ); // sort the carAndReviewsMap with the highest number of reviews and return an array of arrays

      // populating the carAndAverageRatingMap with the average rating of the cars
      $scope.reviews.forEach((review) => {
        if (
          $scope.carAndAverageRatingMap[
            review.car.carName + " " + review.car.carModel
          ]
        ) {
          $scope.carAndAverageRatingMap[
            review.car.carName + " " + review.car.carModel
          ].push(review.rating);
        } else {
          $scope.carAndAverageRatingMap[
            review.car.carName + " " + review.car.carModel
          ] = [review.rating];
        }
      });

      // loop through the each car in carAndAverageRatingMap and calculate the average rating of the cars
      for (const car in $scope.carAndAverageRatingMap) {
        $scope.carAndAverageRatingMap[car] =
          $scope.carAndAverageRatingMap[car].reduce(
            (acc, rating) => acc + rating,
            0
          ) / $scope.carAndAverageRatingMap[car].length;
      }
      console.log($scope.carAndAverageRatingMap);
      $scope.carAndAverageRatingMap = Object.entries(
        $scope.carAndAverageRatingMap
      ).sort((a, b) => b[1] - a[1]); // sort the carAndAverageRatingMap with the decreasingly rating
     
       // populating the carAndBiddingsMap with the number of biddings on the cars
      $scope.AllBookings.forEach((booking) => {
        if (
          $scope.carAndBiddingsMap[
            booking.vehicle.carName + " " + booking.vehicle.carModel
          ]
        ) {
          $scope.carAndBiddingsMap[
            booking.vehicle.carName + " " + booking.vehicle.carModel
          ] += 1;
        } else {
          $scope.carAndBiddingsMap[
            booking.vehicle.carName + " " + booking.vehicle.carModel
          ] = 1;
        }
      });
      // sort the map wi th the highest number of biddings
      console.log($scope.carAndBiddingsMap);
      $scope.carAndBiddingsMap = Object.entries($scope.carAndBiddingsMap).sort(
        (a, b) => b[1] - a[1]
      ); // sorting the map with the secodn element of the array

      $scope.numberOfBidsThisWeekAndMonth = $scope.AllBookings.reduce(
        (acc, bidding) => {
          const bidDate = new Date(bidding.createdAt);
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          if (bidDate >= oneWeekAgo) {
            acc[0] += 1;
          }
          if(bidDate.getMonth() >= new Date().getMonth()){
            acc[1] += 1;
          }
          return acc;
        },
       [0,0]
      );
    }
   
    
    /*
    Function to load all the charts on the view 
    */
    function loadAllCharts() { 
      ChartService.createPieChart(["SUV", "Sedan"], [$scope.suvCars.length, $scope.sedanCars.length], "SUV vs Sedan on the platform", "suvVsSedan"); // create a pie chart for the suv and sedan cars
      ChartService.createBarChart( "bar",$scope.carAndBiddingsMap.map((car) => car[0]).slice(0, 5), $scope.carAndBiddingsMap.map((car) => car[1]).slice(0, 5),  "Number of Biddings","Top 5 most popular car models on the platform","top10Cars"); // create a chart for the top 5 most popular cars
      ChartService.createBarChart("bar", $scope.carAndAverageRatingMap.slice(0, 3).map((car) => car[0]),$scope.carAndAverageRatingMap.slice(0, 3).map((car) => car[1]), "Average Rating","Top 3 Highest Rated Cars","highestRatedCars") // create a chart for the top 3 highest rated cars
      ChartService.createBarChart("bar", $scope.carAndReviewsMap.map((car) => car[0]).slice(0, 3),$scope.carAndReviewsMap.map((car) => car[1]).slice(0, 3),"Number of Reviews","Top 3 most reviewed cars","top5MostReviewedCars") // create a chart for the top 5 most reviewed cars
      ChartService.createBarChart("bar", $scope.numberOfBookingsPerCar
        .map((car) => car[0])
        .slice(
          $scope.numberOfBookingsPerCar.length - 3,
          $scope.numberOfBookingsPerCar.length
        ), $scope.numberOfBookingsPerCar
        .map((car) => car[1])
        .slice(
          $scope.numberOfBookingsPerCar.length - 3,
          $scope.numberOfBookingsPerCar.length
        ),"Number of Bookings","Top 3 most rented cars","mostRentedCars") // create the most rented cars chart
      ChartService.createBarChart( "bar",$scope.numberOfBookingsPerCar
        .map((car) => car[0])
        .slice(0, 3), $scope.numberOfBookingsPerCar
        .map((car) => car[1])
        .slice(0, 3), "Number of Bookings","least rented cars", "leastRentedCars"); // create the least rented cars chart

      ChartService.createBarChart("line" ,$scope.months,$scope.monthlyBookings.map((month) => month.length),  "Monthly Trips",  "Trip Months","monthwiseCarTrips") // create the monthly trips chart
      
      ChartService.createBarChart("bar",$scope.ownerAndAddedCarsMap
        .map((owner) => owner[0])
        .slice(0, 3), $scope.ownerAndAddedCarsMap
        .map((owner) => owner[1])
        .slice(0, 3), "Number of Cars Added", "Top 3 Sellers with most cars added","top3Sellers"); // create the top 3 sellers with most cars added chart
      ChartService.createBarChart("bar", Object.keys($scope.numberOfUsersPerCity), Object.values($scope.numberOfUsersPerCity), "Number of Users", "Number of users per city","numberOfUsersPerCity") // create the number of users per city chart
      ChartService.createPieChart(["Buyers", "Sellers"], [$scope.buyers.length,$scope.sellers.length], "Buyers vs Sellers on the platform","userDescriptionChart"); // create the buyers vs sellers chart
    }

 });