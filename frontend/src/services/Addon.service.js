/**
 * Addon Service Module
 * 
 * This service handles all add-on related operations for the car rental frontend,
 * including creating, retrieving, and deleting add-ons for vehicles.
 * 
 * @module services/Addon.service
 */

angular.module('myApp').service('AddonService', function($q, ApiService, $http) {
    
    /**
     * Add a new add-on
     * @param {Object} addon - The add-on to be added
     * @param {string} addon.name - The name of the add-on
     * @param {number} addon.price - The price of the add-on
     * @returns {Promise} A promise that resolves to the newly created add-on
     */
    this.addAddon = function(addon) {
        const deferred = $q.defer();
        
        $http.post(`${ApiService.baseURL}/api/addon`, addon, { withCredentials: true })
            .then(function(response) {
                deferred.resolve(response.data.addOns);
            })
            .catch(function(error) {
                deferred.reject(error.data.error || 'Error adding add-on');
            });
            
        return deferred.promise;
    };
    
    /**
     * Get all add-ons for the logged-in seller
     * @returns {Promise} A promise that resolves to the list of add-ons
     */
    this.getOwnAddons = function() {
        const deferred = $q.defer();
        
        $http.get(`${ApiService.baseURL}/api/addon/owner`, { withCredentials: true })
            .then(function(response) {
                deferred.resolve(response.data.addOns);
            })
            .catch(function(error) {
                deferred.reject(error.data.error || 'Error fetching add-ons');
            });
            
        return deferred.promise;
    };
    
    /**
     * Get add-ons for a specific owner/seller
     * @param {string} ownerId - The ID of the owner/seller
     * @returns {Promise} A promise that resolves to the list of add-ons
     */
    this.getOwnerAddons = function(ownerId) {
        const deferred = $q.defer();
        
        $http.get(`${ApiService.baseURL}/api/addon/owner/${ownerId}`, { withCredentials: true })
            .then(function(response) {
                deferred.resolve(response.data.addOns);
            })
            .catch(function(error) {
                deferred.reject(error.data.error || 'Error fetching owner add-ons');
            });
            
        return deferred.promise;
    };
    
    /**
     * Delete an add-on
     * @param {string} addonId - The ID of the add-on to delete
     * @returns {Promise} A promise that resolves to the deleted add-on
     */
    this.deleteAddon = function(addonId) {
        const deferred = $q.defer();
        
        $http.delete(`${ApiService.baseURL}/api/addon/${addonId}`, { withCredentials: true })
            .then(function(response) {
                deferred.resolve(response.data.addOns);
            })
            .catch(function(error) {
                deferred.reject(error.data.error || 'Error deleting add-on');
            });
            
        return deferred.promise;
    };
});