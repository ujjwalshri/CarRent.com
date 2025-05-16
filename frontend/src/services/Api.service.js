angular.module('myApp').service('ApiService', function() {
    const ISPRODUCTION = false; // Flag to indicate if the app is in production mode
    this.baseURL = ISPRODUCTION ? 'car-rent-cpbwtu35q-ujjwals-projects-76fd4110.vercel.app' : 'http://localhost:8000'; // Base URL of the Backend API
});