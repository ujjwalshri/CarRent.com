angular.module('myApp').service('ApiService', function() {
    const ISPRODUCTION = window.location.hostname !== 'localhost';
    this.baseURL = ISPRODUCTION ? 'https://carrent-com-7.onrender.com' : 'http://localhost:8000';
});