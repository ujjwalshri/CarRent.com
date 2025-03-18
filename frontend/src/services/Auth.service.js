// auth service to interact with the database
angular.module('myApp').service('AuthService', function($q, IDB, ApiService, $http,$state) {
    // function to validate the user
    this.validateUser = function(user) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // regex for email validation 
        if (user.password.trim() !== user.confirmPassword.trim()) {
            return $q.reject("Passwords do not match!");
        } 
        if(user.password.trim().length < 8){  
            return $q.reject("Password should be atleast 8 characters long");
        }
        if(String(user.adhaar).length !== 12){
            return $q.reject("Adhaar number should be 12 digits long");
        }
        if(user.username.trim().length < 6){
            return $q.reject("Username should be atleast 6 characters long");
        }
        if(emailRegex.test(user.email.trim())===false){
            return $q.reject("Invalid email address");
        }
        if(user.firstName.trim().length < 3){
            return $q.reject("First name should be atleast 3 characters long");
        }
        return $q.resolve();
    };
    // function to get the user from the database by userId of the cookie
    this.getMe = function(){
        const deferred = $q.defer();
        $http.get(`${ApiService.baseURL}/api/auth/me`, { withCredentials: true })
            .then(function(response) {
                console.log('User:', response.data);
                deferred.resolve(response.data);
            })
            .catch(function(error) {
                console.error();
                deferred.reject(`'Error getting the loggedin user:', ${error}`); // Reject the promise with the error
            });
        return deferred.promise
    }

     // function to login the user
    this.loginUser = function(username, password) {
        const deferred = $q.defer();
        $http({method: "POST",
            url: "http://localhost:8000/api/auth/login",
            data: {
                username: username,
                password: password
            },
            withCredentials: true})
            .then(function(response) {
                console.log('User logged in:', response.data);
                deferred.resolve(response.data);
                return response.data; // Return the response data from the server
            })
            .catch(function(error) {
                console.error('Error logging in user:', error);
                deferred.reject(`Error logging in user: ${error}`); // Reject the promise with the error
            });
        return deferred.promise;
    };
// function to register the user
this.registerUser = function(user) {
    console.log(user);
    let deffered = $q.defer();
    $http.post(`${ApiService.baseURL}/api/auth/signup`, {
        username: user.username,
        password: user.password,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        city: user.city,
        adhaar: user.adhaar
    }, { withCredentials: true })
        .then(function(response) {
            console.log('User registered:', response.data);
            deffered.resolve(response.data);
            return response.data; // Return the response data from the server
        })
        .catch(function(error) {
            console.error('Error registering user:', error);
            deffered.reject(error); // Reject the promise with the error
        });
    return deffered.promise;
};
});