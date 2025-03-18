angular.module('myApp').service('RouteProtection', function() {
    this.isAuthorized = ()=>{ // check if user is logged in
        console.log("agohuidgahai");
        return true;
    }
    this.isAdmin = () => {   // check if user is an admin
        return false;
    }
    this.isSeller = ()=>{ // check if user is a seller
        return false;
    }
    this.isBuyer = ()=>{  // check if user is a buyer
      return true;
    }
});