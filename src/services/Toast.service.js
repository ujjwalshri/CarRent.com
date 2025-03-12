
angular.module('myApp').service('ToastService', function (){
    // function to show the toast message
    const defaultOptions = { // default options for the toast message
        duration : 3000,
        close: true,
        gravity: 'top',
        position: 'right',
        stopOnFocus: true
    }
    // function to show the success message
    this.success = function(message){
        Toastify({
            ...defaultOptions, 
            text: message,
            backgroundColor: '#4caf50'
        }).showToast();
    }
    // function to show the error message
    this.error = function(message){
        Toastify({
            ...defaultOptions, 
            text:message,
            backgroundColor: '#f44336'
        }).showToast();
    }
    // function to show the info message
    this.info = function(message){
        Toastify({
            ...defaultOptions, 
            text:message, 
            backgroundColor: '#2196f3'
        }).showToast();
    }
})