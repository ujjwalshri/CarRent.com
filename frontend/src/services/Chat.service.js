angular.module('myApp').service('ChatService', function($q, ApiService, $http) {    
    /**
     * Creates a conversation
     * @param {*} owner 
     * @param {*} vehicleId 
     * @returns created conversation
     */
    this.createConversation = function(owner, vehicleId){

        const deferred = $q.defer();
        $http.post(`${ApiService.baseURL}/api/conversation/addConversation/${vehicleId}`, owner, { withCredentials: true })
            .then((res) => {
                deferred.resolve(res.data);
            })
            .catch((err) => {
                console.log(err);
                deferred.reject(`Error creating conversation: ${err}`);
            });
        return deferred.promise;
    }
    /**
     * Gets all conversations
     * @returns all the conversations
     */
    this.getAllConversations = function(searchQuery){
        const deferred = $q.defer();
        $http.get(`${ApiService.baseURL}/api/conversation/getAllConversations`, { params: {
                searchQuery: searchQuery
        }, withCredentials: true })
            .then((res) => {
                deferred.resolve(res.data);
            })
            .catch((err) => {
                deferred.reject(`Error fetching conversations: ${err}`);
            });
        return deferred.promise;
    }
    /**
     * Gets all conversations at a car id
     * @param {*} id 
     * @returns all the conversations at a car id
     */
    this.getConversationsAtCarId = function(id){

        const deferred = $q.defer();
        $http.get(`${ApiService.baseURL}/api/conversation/getConversatons/vehicle/${id}`, { withCredentials: true })
            .then((res) => {
                deferred.resolve(res.data);
            })
            .catch((err) => {
                deferred.reject(`Error fetching conversations: ${err}`);
            });
        return deferred.promise;
    }
    /**
     * Adds a message
     * @param {*} formData 
     * @param {*} conversationId 
     * @returns added message
     */
    this.addMessage = ( formData , conversationId)=>{
        const deferred = $q.defer();
        $http.post(`${ApiService.baseURL}/api/message/addMessage/${conversationId}`, formData, { withCredentials: true, headers: { 'Content-Type': undefined },
            transformRequest: angular.identity })
            .then((res) => {
                deferred.resolve(res.data);
            })
            .catch((err) => {
                deferred.reject(`Error adding message: ${err}`);
            });
        return deferred.promise;
    }
    /**
     * Gets all messages
     * @param {*} conversationId 
     * @returns all the messages of a conversation
     */
    this.getAllMessages = (conversationId)=>{

        const deferred = $q.defer();
        $http.get(`${ApiService.baseURL}/api/message/getMessages/${conversationId}`, { withCredentials: true })
            .then((res) => {
                deferred.resolve(res.data);
            })
            .catch((err) => {
                deferred.reject(`Error fetching messages: ${err}`);
            });
        return deferred.promise;

    }
    /**
     * Gets all attachments
     * @param {*} conversationId 
     * @returns all the attachments of a conversation
     */
    this.getAllAttachments = (conversationId)=>{

        const deferred = $q.defer();
        $http.get(`${ApiService.baseURL}/api/message/getAttachments/${conversationId}`, { withCredentials: true })
            .then((res) => {
                console.log(res.data);
                deferred.resolve(res.data);
            })
            .catch((err) => {
                deferred.reject(`Error fetching attachments: ${err}`);
            });
        return deferred.promise;
    }
});