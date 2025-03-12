angular.module('myApp').factory('BackButton', function($window){
   return {
    back : function(){
        $window.history.back();
    }
}
})