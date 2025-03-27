angular.module('myApp').controller('bookingsHistoryCtrl', function($scope, IDB, Booking, ToastService, Review, BackButton, BiddingService, $state) {
    $scope.back = BackButton.back; // back function to go back to the previous page
    $scope.bookings = []; // array to hold all the boooking histories
    $scope.calculateBookingPrice = Booking.calculate; // function to calculate the booking price from the booking factory
    $scope.currentPage = 1; // setting the current page to 1
    $scope.itemsPerPage = 6; // setting the items per page to 5
    $scope.isLoading = false; // setting the isLoading to false
    $scope.hasMoreData = true; // setting the hasMoreData to true
    $scope.startDate = '';

     //  init to initialize the page data 
    $scope.init = ()=>{
        fetchBookingHistory();
    }
    /** 
    function to fetch all the bookings
    @{params} none
    @{returns} none
    */
    function fetchBookingHistory() {
        console.log('search' , $scope.search);
        $scope.isLoading = true;
        const params = {
            page: $scope.currentPage,
            limit: $scope.itemsPerPage,
            startDate: $scope.startDate || undefined,
        }
        BiddingService.getUserBookingsHistory(params).then((bookings)=>{
            $scope.bookings = $scope.bookings.concat(bookings.bookings);
            console.log($scope.bookings);
            console.log(bookings.totalDocs);
            $scope.hasMoreData = bookings.totalDocs > $scope.bookings.length;
            $scope.totalItems = Math.ceil(bookings.totalDocs/$scope.itemsPerPage);
            console.log($scope.totalItems);
        }).catch((err)=>{
            ToastService.error(`Error fetching bookings ${err}`);
        }).finally(()=>{
            $scope.isLoading = false;
        })
    }
    // function to change the page
    $scope.pageChanged = function() {
        $scope.currentPage = $scope.currentPage + 1;
        fetchBookingHistory();
    };

   /*
    function to create the bill and download the bill as a pdf
    @params booking
    @returns none
    */
    $scope.downloadBillAsPDF = (booking) => {
        var docDefinition = { 
            content: [
                { text: 'Booking Details', style: 'header' },
                { text: 'Booking ID: ' + booking._id },
                { text: 'Car: ' + booking.vehicle.company + ' ' + booking.vehicle.name + ' ' + booking.vehicle.modelYear },
                { text: 'Owner: ' + booking.owner.username },
                { text: 'Name: ' + booking.owner.firstName + ' ' + booking.owner.lastName },
                {  text: 'Start Date: ' + new Date(booking.startDate).toLocaleDateString()},
                { text: 'End Date: ' + new Date(booking.endDate).toLocaleDateString() },
                { text: 'Start Odometer Value: ' + booking.startOdometerValue },
                { text: 'per day price: ' + booking.amount + 'per day' },
                { text: 'End Odometer Value: ' + booking.endOdometerValue },
                {
                    text: 'Total Amount: ' + 
                          ($scope.calculateBookingPrice(booking.startDate, booking.endDate, booking.amount) + 
                          (booking.endOdometerValue - booking.startOdometerValue > 300 
                            ? ((booking.endOdometerValue - booking.startOdometerValue) - 300) * 10
                            : 0)) + '$'
                },
                {
                    text: 'Fine applied on additional kms: ' + 
                          (booking.endOdometerValue - booking.startOdometerValue > 300 
                            ? (((booking.endOdometerValue - booking.startOdometerValue) - 300)) * 10 
                            : 0) + '$'
                }
            ],
            styles: {
                header: {
                    fontSize: 30,
                    bold: true,
                    margin: [0, 10, 0, 10]
                }
            }
        };
        pdfMake.createPdf(docDefinition).print(); // create the pdf and print it using the print function
        
    };

});