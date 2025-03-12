angular.module('myApp').service('RouteProtection', function() {
    this.isAuthorized = ()=>{ // check if user is logged in
        return JSON.parse(sessionStorage.getItem("user") )? true : false;
    }
    this.isAdmin = () => {   // check if user is an admin
        const user = JSON.parse(sessionStorage.getItem("user"));
        if (!user) return false;
        return user.role === "admin";
    }
    this.isSeller = ()=>{ // check if user is a seller
        return JSON.parse(sessionStorage.getItem("user") ).isSeller === true ? true : false;
    }
    this.isBuyer = ()=>{  // check if user is a buyer
        return JSON.parse(sessionStorage.getItem("user") ).isSeller === false ? true : false;
    }
});