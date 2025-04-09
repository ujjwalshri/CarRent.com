
angular.module('myApp').service('ToastService', function (){
    /**
     * Default options for the toast message
     * @type {Object}
     */
    const defaultOptions = { // default options for the toast message
        duration : 3000,
        close: true,
        gravity: 'top',
        position: 'right',
        stopOnFocus: true
    }
   /**
    * Function to show the success message
    * @param {string} message - The message to show
    */
    this.success = function(message){
        Toastify({
            ...defaultOptions, 
            text: message,
            backgroundColor: '#4caf50'
        }).showToast();
    }
    /**
     * Function to show the error message
     * @param {string} message - The message to show
     */
    this.error = function(message){
        Toastify({
            ...defaultOptions, 
            text:message,
            backgroundColor: '#f44336'
        }).showToast();
    }
    /**
     * Function to show the info message
     * @param {string} message - The message to show
     */
    this.info = function(message){
        Toastify({
            ...defaultOptions, 
            text:message, 
            backgroundColor: '#2196f3'
        }).showToast();
    }
})