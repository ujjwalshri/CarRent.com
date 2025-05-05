/**
 * Tax Service Module
 * 
 * This module provides functions to interact with the tax management API endpoints.
 * Used by admin for managing platform taxes.
 */
angular.module('myApp').service('TaxService', function($http, $q, ApiService) {
    
    /**
     * Retrieves all taxes from the API
     * @returns {Promise} A promise that resolves to the list of taxes
     */
    this.getAllTaxes = function() {
        const deferred = $q.defer();
        
        $http.get(`${ApiService.baseURL}/api/taxes/getAllTaxes`)
            .then((response) => {
                deferred.resolve(response.data);
            })
            .catch((error) => {
                deferred.reject(`Error fetching taxes: ${error.data?.message || error}`);
            });
            
        return deferred.promise;
    };
    
    /**
     * Creates a new tax
     * @param {Object} taxData - The tax data to be created
     * @returns {Promise} A promise that resolves to the newly created tax
     */
    this.addTax = function(taxData) {
        const deferred = $q.defer();
        
        $http.post(`${ApiService.baseURL}/api/taxes/addTax`, taxData, { withCredentials: true })
            .then((response) => {
                deferred.resolve(response.data);
            })
            .catch((error) => {
                deferred.reject(`Error adding tax: ${error.data?.message || error}`);
            });
            
        return deferred.promise;
    };
    
    /**
     * Updates an existing tax
     * @param {string} taxId - The ID of the tax to update
     * @param {Object} taxData - The updated tax data
     * @returns {Promise} A promise that resolves to the updated tax
     */
    this.updateTax = function(taxId, taxData) {
        const deferred = $q.defer();
        
        $http.put(`${ApiService.baseURL}/api/taxes/updateTax/${taxId}`, taxData, { withCredentials: true })
            .then((response) => {
                deferred.resolve(response.data);
            })
            .catch((error) => {
                deferred.reject(`Error updating tax: ${error.data?.message || error}`);
            });
            
        return deferred.promise;
    };
    
    /**
     * Deletes a tax
     * @param {string} taxId - The ID of the tax to delete
     * @returns {Promise} A promise that resolves when the tax is successfully deleted
     */
    this.deleteTax = function(taxId) {
        const deferred = $q.defer();
        
        $http.delete(`${ApiService.baseURL}/api/taxes/deleteTax/${taxId}`, { withCredentials: true })
            .then((response) => {
                deferred.resolve(response.data);
            })
            .catch((error) => {
                deferred.reject(`Error deleting tax: ${error.data?.message || error}`);
            });
            
        return deferred.promise;
    };
    
    /**
     * Toggles the active status of a tax
     * @param {string} taxId - The ID of the tax to toggle
     * @returns {Promise} A promise that resolves to the updated tax
     */
    this.toggleTaxStatus = function(taxId) {
        const deferred = $q.defer();
        
        $http.patch(`${ApiService.baseURL}/api/taxes/toggleTaxStatus/${taxId}`, {}, { withCredentials: true })
            .then((response) => {
                deferred.resolve(response.data);
            })
            .catch((error) => {
                deferred.reject(`Error toggling tax status: ${error.data?.message || error}`);
            });
            
        return deferred.promise;
    };
});