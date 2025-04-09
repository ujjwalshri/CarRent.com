

angular.module('myApp').service('ChatService', function($q, ApiService, $http) {    
    /*
    function to create a conversation
    @params owner, vehicleId
    @returns promise
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
    /*
    function to get all conversations
    @params none
    @returns promise
    */
    this.getAllConversations = function(){
        const deferred = $q.defer();
        $http.get(`${ApiService.baseURL}/api/conversation/getAllConversations`, { withCredentials: true })
            .then((res) => {
                deferred.resolve(res.data);
            })
            .catch((err) => {
                deferred.reject(`Error fetching conversations: ${err}`);
            });
        return deferred.promise;
    }
    /*
    function to get all conversations at a car id
    @params id
    @returns promise
    */
    this.getConversationsAtCarId = function(id){
        console.log(id);
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
    /*
    function to add a message
    @params formData, conversationId
    @returns promise
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
    /*
    function to get all messages
    @params conversationId
    @returns promise
    */
    this.getAllMessages = (conversationId)=>{
        console.log(conversationId);
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
    /*
    function to get all attachments
    @params conversationId
    @returns promise
    */
    this.getAllAttachments = (conversationId)=>{
        console.log(conversationId);
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