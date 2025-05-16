angular.module('myApp').service('ApiService', function() {
    const ISPRODUCTION = true;
    this.baseURL = ISPRODUCTION ? 'https://carrent-com-7.onrender.com' : 'http://localhost:8000';
});