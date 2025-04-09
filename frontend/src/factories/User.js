angular.module('myApp').factory('UserFactory', function () {
    /**
     * User Constructor Function
     * @param {string} _id - Unique identifier for the user.
     * @param {string} firstName - User's first name.
     * @param {string} lastName - User's last name.
     * @param {string} email - User's email address.
     * @param {string} username - User's username.
     * @param {boolean} isBlocked - Indicates if the user is blocked.
     * @param {boolean} isSeller - Indicates if the user is a seller.
     * @param {boolean} isAdmin - Indicates if the user is an admin.
     * @param {string} city - User's city.
     * @param {string} adhaar - User's Aadhaar number.
     */
    function User(
        _id = null,
        firstName = null,
        lastName = null,
        email = null,
        username = null,
        isBlocked = false,
        isSeller = false,
        isAdmin = false,
        password = null,
        confirmPassword = null,
        city = null,
        adhaar = null
    ) {
        if (!(this instanceof User)) {
            return new User(_id, firstName, lastName, email, username, isBlocked,isSeller, isAdmin,password, confirmPassword,  city, adhaar);
        }
        this._id = _id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.username = username;
        this.isBlocked = isBlocked;
        this.isSeller = isSeller;
        this.isAdmin = isAdmin;
        this.password = password;
        this.confirmPassword = confirmPassword;
        this.city = city;
        this.adhaar = adhaar;
    }

    /**
     * Validate User Data
     * @returns {boolean} - Returns true if valid, false otherwise.
     */
    User.prototype.validate = function () {
        console.log(this);
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const usernameRegex = /^[a-zA-Z0-9_!@#$%^&*()-+=]{3,20}$/;
        const nameRegex = /^[A-Za-z]{2,50}$/;
        const cityRegex = /^[A-Za-z ]{2,100}$/;
        const adhaarRegex = /^[0-9]{12}$/;

        if (!this.firstName || !nameRegex.test(this.firstName)) {
            return "invalid first name";
        }
        if (!this.lastName || !nameRegex.test(this.lastName)) {
            return "invalid last name";
        }
        if (!this.email || !emailRegex.test(this.email)) {
            return "invalid email";
        }
        if (!this.username || !usernameRegex.test(this.username)) {
            return "invalid username";
        }
        if (this.city && !cityRegex.test(this.city)) {
            return "invalid city";
        }
        if(!this.password || this.password.length < 6){
            return "password must be atleast 6 characters long";
        }
        if(!this.confirmPassword || this.confirmPassword.length < 6){
            return "confirm password must be atleast 6 characters long";
        }
        if(this.password !== this.confirmPassword){
            return "password and confirm password must be same";
        }
        if (this.adhaar && !adhaarRegex.test(this.adhaar)) {
            return "invalid adhaar";
        }
        return this;
    };


    return {
        /*
        function to create a user object
        @params data
        @returns User object or error message
        */
        create: function (data, validate=true) {
            
            console.log(data);
            var user =  new User(
                data._id,
                data.firstName,
                data.lastName,
                data.email,
                data.username,
                
                data.isBlocked,
                data.isSeller,
                data.isAdmin,
                data.password,
                data.confirmPassword,
                data.city,
                data.adhaar
            );
            if(validate){
                return user.validate();
            }
            return user;
        },
        // function to validate the update user data before sending to the server
        validateUpdateUserData : function (data) {  
            const nameRegex = /^[A-Za-z]{2,50}$/;
            if (!data.firstName || !nameRegex.test(data.firstName)) {
                return "invalid first name";
            }
            if (!data.lastName || !nameRegex.test(data.lastName)) {
                return "invalid last name";
            }
            if(data.firstName.trim().length<3 || data.firstName.trim().length>50 || data.lastName.trim().length<3 || data.lastName.trim().length>50){
                return "first name and last name must be atleast 3 to 50 characters long";
            }
          
            return true;
        }
    };
});
