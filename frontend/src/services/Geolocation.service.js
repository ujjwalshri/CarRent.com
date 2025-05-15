/**
 * Geolocation Service
 * Handles getting user's geolocation and extracting city information
 */
angular.module('myApp').service('GeolocationService', ['$q', '$http', 'ApiService', function($q, $http) {
    var service = this;
    
    /**
     * Get current position using browser's geolocation API
     * @returns {Promise} Promise resolving to geolocation coordinates
     */
    service.getCurrentPosition = function() {
        var deferred = $q.defer();
        
        if (!navigator.geolocation) {
            deferred.reject('Geolocation is not supported by your browser');
            return deferred.promise;
        }
        
        navigator.geolocation.getCurrentPosition(
            function(position) {
                deferred.resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
            },
            function(error) {
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        deferred.reject("User denied the request for geolocation");
                        break;
                    case error.POSITION_UNAVAILABLE:
                        deferred.reject("Location information is unavailable");
                        break;
                    case error.TIMEOUT:
                        deferred.reject("The request to get user location timed out");
                        break;
                    case error.UNKNOWN_ERROR:
                        deferred.reject("An unknown error occurred");
                        break;
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
        
        return deferred.promise;
    };
    
    /**
     * Extract city information using reverse geocoding
     * Uses third-party APIs to convert coordinates to address information
     * @param {Object} coordinates Object containing latitude and longitude
     * @returns {Promise} Promise resolving to location data including city
     */
    service.getCityFromCoordinates = function(coordinates) {
        var deferred = $q.defer();
        
        // Using Nominatim OpenStreetMap API for reverse geocoding
        // This is a free service but has usage limitations
        var apiUrl = 'https://nominatim.openstreetmap.org/reverse?lat=' + 
            coordinates.latitude + '&lon=' + coordinates.longitude + 
            '&format=json';
            
        $http({
            method: 'GET',
            url: apiUrl,
            headers: {
                'Accept': 'application/json',
            }
        }).then(function(response) {
            if (response.data && response.data.address) {

                var locationData = {
                    city: response.data.address.city ||
                    response.data.address.state || 
                    'Unknown',
                    state: response.data.address.state || 'Unknown',
                    country: response.data.address.country || 'Unknown',
                    fullAddress: response.data.display_name || 'Unknown address',
                    raw: response.data // Keep raw data for additional processing if needed
                };
                console.log("Location Data: ", locationData);
                deferred.resolve(locationData);
            } else {
                deferred.reject('No location data found');
            }
        }, function(error) {
            deferred.reject('Error getting location details: ' + error.statusText);
        });
        
        return deferred.promise;
    };
    
    /**
     * Combined method to get current location with city information
     * @returns {Promise} Promise resolving to user's location data
     */
    service.getUserLocationWithCity = function() {
        var deferred = $q.defer();
        
        service.getCurrentPosition()
            .then(function(coordinates) {
                service.getCityFromCoordinates(coordinates)
                    .then(function(locationData) {
                        // Add coordinates to the location data
                        locationData.coordinates = coordinates;
                        deferred.resolve(locationData);
                    })
                    .catch(function(error) {
                        deferred.reject(error);
                    });
            })
            .catch(function(error) {
                deferred.reject(error);
            });
            
        return deferred.promise;
    };
    
    return service;
}]);