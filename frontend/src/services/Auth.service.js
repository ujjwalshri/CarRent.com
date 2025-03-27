// auth service to interact with the database
angular.module('myApp').service('AuthService', function($q, IDB, ApiService, $http,$state) {
    /* function to validate the user
    @params user
    @returns promise
    */
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

    /*
    function to logout the user
    @params none
    @returns promise
    */
    this.logout = function(){
        let deffered = $q.defer();
        $http.post(`${ApiService.baseURL}/api/auth/logout`, {}, { withCredentials: true }).then((res)=>{
            
            deffered.resolve(`logged out successfully`);
            $state.go('login');
        }).catch((err)=>{
            deffered.reject(`error logging out ${err}`);
        })
        return deffered.promise;
    }
   
  

     /*
    function to login the user
    @params username, password
    @returns promise
    */

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
                console.log(error.data.err);
                deferred.reject(`Error logging in user: ${error.data.err}`); // Reject the promise with the error
            });
        return deferred.promise;
    };
  /*
    function to register the user
    @params user
    @returns promise
    */
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
            console.error('Error registering user:', error.data.message);
            deffered.reject(error.data.message); 
        });
    return deffered.promise;
};
});