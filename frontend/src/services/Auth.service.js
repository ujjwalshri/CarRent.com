// auth service to interact with the database
angular.module('myApp').service('AuthService', function($q, ApiService, $http, $state, SocketService) {

    /**
     * Logout the user
     * @returns promise
     */
    this.logout = function(){
        let deffered = $q.defer();
        
        // Disconnect socket before logout
        const socket = SocketService.getSocket();
        if (socket) {
            SocketService.disconnect();
        }
        
        $http.post(`${ApiService.baseURL}/api/auth/logout`, {}, { withCredentials: true }).then((res)=>{
            deffered.resolve(`logged out successfully`);
            $state.go('login');
        }).catch((err)=>{
            deffered.reject(`error logging out ${err}`);
        })
        return deffered.promise;
    }
   
  

    /**
     * Login the user
     * @param {string} username - The username of the user
     * @param {string} password - The password of the user
     * @returns promise
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
                
                try {
                    // Initialize socket immediately after login - this will
                    // automatically set the user as online when connected
                    SocketService.initialize(response.data);
                    
                    deferred.resolve(response.data);
                } catch (error) {
                    console.error('Error initializing socket:', error);
                    // Still resolve even if socket fails
                    deferred.resolve(response.data);
                }
            })
            .catch(function(error) {
                console.error('Error logging in user:', error);
                console.log(error.data.err);
                deferred.reject(`Error logging in user: ${error.data.err}`);
            });
        return deferred.promise;
    };
  /**
     * Register the user
     * @param {object} user - The user object
     * @returns promise
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