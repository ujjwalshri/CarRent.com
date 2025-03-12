angular.module('myApp').controller('sellerAnalyticsCtrl', function($scope,$q, IDB, ToastService, ChartService, BackButton) {
     // retriving the loggedinUser 
    $scope.back = BackButton.back; // back function
    const loggedInUser = JSON.parse(sessionStorage.getItem("user"));
    $scope.init = () => {
        $scope.months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']; // array of months
        $scope.monthWiseBookings = []; // map to store the bookings at each month
        $scope.carsAndBidsMap = {}; // map to store all cars names and the amount of bids they have
        $scope.cityAndBookingMap = {}; // map to store all cities of users and the amount of bookings they have
        $scope.carAndBookingsMap = {}; // map to store all cars and the amount of bookings they have
        fetchChartDataForSeller();
    }
    // functions to fetch all biddings for a particular seller
    function fetchChartDataForSeller(){
       $q.all([
        IDB.getAllCarsByUser(loggedInUser.id), // get all cars by the user
        IDB.getBookingsByOwnerId(loggedInUser.id), // get all biddings for the user's car
        IDB.getAllBookings(), // get all biddings
        IDB.getAllUsers() // get all users
        
       ])
       .then((res)=>{
        console.log(res);
        calculateChartData(res); // calculate the data
        createSellerCharts(); // create the charts
       })
       .catch((err)=>{
         ToastService.error(`error fetching seller data ${err}` ); // error toast
       })
    }

    function calculateChartData(res){
        const cars = res[0];
         $scope.suvCars = cars.filter(car=> car.category=== 'SUV' && car.deleted === false);
         $scope.sedanCars = cars.filter(car=> car.category=== 'Sedan' && car.deleted === false);
         $scope.numberOfCars = cars.length;
         console.log(res[1]);
         const biddings = res[1];
         $scope.numberOfBidsOnLocalCars = biddings.filter((bidding)=> bidding.vehicle.location==="local").length;
         $scope.numberOfBidsOnOutstationCars = biddings.filter((bidding)=> bidding.vehicle.location==="outstation").length;
         $scope.numberOfBidsOnBothCars = biddings.filter((bidding)=> bidding.vehicle.location==="both").length;
         
         $scope.numberOfBiddingsInLast7days = biddings.filter((bidding)=> bidding.createdAt >= new Date(new Date().setDate(new Date().getDate() - 7))).length;
         $scope.bookings = biddings.filter(booking => booking.status === "approved" || booking.status==="reviewed"); // filter out the approved biddings
     
         biddings.forEach(bidding => {  // loop through all biddings
             const carName = bidding.vehicle.carName + ' ' + bidding.vehicle.carModel;
             if ($scope.carsAndBidsMap[carName]) {
                 $scope.carsAndBidsMap[carName] += 1;
             } else {
                 $scope.carsAndBidsMap[carName] = 1;
             }
         });
       
         $scope.bookings.forEach(booking => { // loop through all bookings
             const city = booking.from.city;
             if ($scope.cityAndBookingMap[city]) { // if the city is already in the map increment the count
                 $scope.cityAndBookingMap[city] += 1;
             } else {
                 $scope.cityAndBookingMap[city] = 1; // else add the city to the map
             }
         });
 
         $scope.bookings.forEach(bookings =>{
             const carName = bookings.vehicle.carName + ' ' + bookings.vehicle.carModel;
             if($scope.carAndBookingsMap[carName]){
                 $scope.carAndBookingsMap[carName] += 1;
             }else{
                 $scope.carAndBookingsMap[carName] = 1;
             }
         })
 
         $scope.months.forEach((month, index)=>{
             $scope.monthWiseBookings[index] = $scope.bookings.filter(booking => new Date(booking.startDate).getMonth() === index).length; // filter the bookings with the start month equal to the index value in the array
         });
 
 
         console.log($scope.monthWiseBookings);
         
         console.log($scope.carAndBookingsMap);
 
         console.log($scope.cityAndBookingMap);
         console.log($scope.carsAndBidsMap);
         $scope.carsAndBidsMap = Object.entries($scope.carsAndBidsMap).sort((a, b) => b[1] - a[1]); // sort the map by the number of bids and return an array of sorted entries
         const allBiddings = res[2];
         $scope.myBiddingsInLast7days = biddings.filter((bidding)=> bidding.createdAt >= new Date(new Date().setDate(new Date().getDate() - 7))).length;
         const otherUsersBiddingsInLast7days = allBiddings.filter((bid)=>{
             return bid.createdAt >= new Date(new Date().setDate(new Date().getDate() - 7)) && bid.owner.id !== loggedInUser.id;
         }).length;
         const otherSellers = res[3].filter((user)=> user.isSeller && user.username !== loggedInUser.username).length;
         $scope.averageBidsOfOtherSellers = (otherUsersBiddingsInLast7days / otherSellers).toFixed(2);
         if(otherSellers === 0){
             $scope.averageBidsOfOtherSellers = 0;
         }
         console.log($scope.myBiddingsInLast7days);
         console.log($scope.averageBidsOfOtherSellers);
 
         // calculate the number of bids in last week and the number of bids in the 2nd last week
         $scope.lastWeekBids = biddings.filter((bidding) => bidding.createdAt >= new Date(new Date().setDate(new Date().getDate() - 7)).getTime());
         $scope.secondLastWeekBids = biddings.filter((bidding) => bidding.createdAt >= new Date(new Date().setDate(new Date().getDate() - 14)).getTime() && bidding.createdAt < new Date(new Date().setDate(new Date().getDate() - 7)).getTime());
         console.log($scope.lastWeekBids);
         console.log($scope.secondLastWeekBids);
 
 
 
 
 }

    function createSellerCharts(){
        ChartService.createPieChart(["SUV", "Sedan"],[$scope.suvCars.length,$scope.sedanCars.length], 'Number of bookings per month', 'suvVsSedanForSeller'); // call the createPieChart function from the ChartService
        ChartService.createBarChart("bar" ,  Object.keys($scope.carAndBookingsMap), Object.values($scope.carAndBookingsMap),'Number of bookings',"Car wise bookings", "carAndBookingsChart" ); // call the createBarChart function from the ChartService
        ChartService.createBarChart("bar",Object.keys($scope.cityAndBookingMap), Object.values($scope.cityAndBookingMap),'Number of bookings', "City Wise Bookings",  "cityWiseBooking"); // call the createBarChart function from the ChartService create city wise bookings chart
        ChartService.createBarChart("bar", $scope.carsAndBidsMap.slice(0, 3).map(car => car[0]), $scope.carsAndBidsMap.slice(0, 3).map(car => car[1]), 'Number of bids',"Top 3 Most Popular cars of yours","myMostPopularCar"); // call the createBarChart function from the ChartService
        ChartService.createBarChart("bar", $scope.months,$scope.monthWiseBookings, 'Number of bookings',"Month wise bookings","numberOfBookingsPerMonth"); // call the createBarChart function from the ChartService
        ChartService.createPieChart( ["Local", "Outstation", "Both"], [$scope.numberOfBidsOnLocalCars, $scope.numberOfBidsOnOutstationCars, $scope.numberOfBidsOnBothCars], 'Number of bidding LocalVsOutstationVsBoth', 'localVsOutstationVsBoth'); // call the createPieChart function from the ChartService
        createMyBiddingsVsOtherSellersAvgChart(); // creating the multiline charts
        createLastWeekBidsVsSecondLastWeekBidsChart(); // create the multiline charts
    }


   
            


    function createMyBiddingsVsOtherSellersAvgChart(){
        // create a line chart with two lines one for the user and the other for the average of other sellers
        const labels = ['You', 'Other Sellers'];
        const data = [$scope.myBiddingsInLast7days, $scope.averageBidsOfOtherSellers];
        var ctx = document.getElementById("biddingsInLast7days").getContext("2d");
        const myBiddingsVsOtherSellersAvgChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Number of bids',
                    data: data,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(54, 162, 235, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(54, 162, 235, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                title: {
                    display: true,
                    text: "Your biddings in the last 7 days vs other sellers average"
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        });
    }

    function createLastWeekBidsVsSecondLastWeekBidsChart() {
        // Get the canvas context
        var ctx = document.getElementById("bidComparasion").getContext("2d");
    
        // Labels (X-Axis)
        const labels = ['Second Last Week Bids', 'Last Week Bids'];
    
        // Data for the user and the average of other sellers
        const userBidsData = [$scope.secondLastWeekBids.length, $scope.lastWeekBids.length];
        const avgOtherSellersData = [$scope.secondLastWeekAvgBids, $scope.lastWeekAvgBids];
    
        console.log("User Bids:", userBidsData);
        console.log("Average Other Sellers Bids:", avgOtherSellersData);
    
        // Create Chart
        const lastWeekBidsVsSecondLastWeekBidsChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: '',
                        data: userBidsData,
                        borderColor: 'rgba(255, 99, 132, 1)',
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        borderWidth: 2,
                        pointRadius: 5,
                        
                        fill: false,
                        tension: 0.3 
                    },
                    {
                        label:'',
                        data: avgOtherSellersData,
                        borderColor: 'rgba(54, 162, 235, 1)',
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        borderWidth: 2,
                        pointRadius: 5,
                        
                        fill: false,
                        tension: 0.3 
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    title: {
                        display: true,
                        text: "Your Biddings vs Other Sellers (Last 2 Weeks)",
                        font: {
                            size: 16
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: "Number of Bids"
                        },
                        ticks: {
                            stepSize: 1
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: "Weeks"
                        }
                    }
                }
            }
        });
    }
    
});