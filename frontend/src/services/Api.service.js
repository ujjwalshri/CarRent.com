angular.module('myApp').service('ApiService', function() {
    const ISPRODUCTION = true; // Flag to indicate if the app is in production mode
    this.baseURL = ISPRODUCTION ? 'https://carrent-com-7.onrender.com/' : 'http://localhost:8000'; // Base URL of the Backend API
});