mainApp.service('chatService', ['$http', '$q', 'errorService', '$timeout',
    function ($http, $q, errorService, $timeout) {

        const BASE_URL = 'http://127.0.0.1:8006/api/v1/chat';

        /**
         * @function generateChatId()
         * @description Generate chatId for a chat.
         * @param {*} userId 
         * @param {*} ownerId 
         * @param {*} carId 
         * @returns string
         */
        function generateChatId(userId, ownerId, carId) {
            return `${userId}_${ownerId}_${carId}`;
        }

        /**
         * @function getUserConversations()
         * @description Get all conversations for a user.
         * @param {*} userId 
         * @returns resolved or rejected promise.
         */
        this.getUserConversations = function (userId) {
            console.log("User Id :: ", userId);
            return $http.get(`${BASE_URL}/user/${userId}`)
                .then(response => response.data)
                .catch(error => errorService.handleError(error, 'ChatService :: User Conversations Fetch Failed'));
        };

        /**
         * @function getOwnerConversations()
         * @description Get all conversations for an owner.
         * @param {*} ownerId 
         * @returns resolved or rejected promise.
         */
        this.getOwnerConversations = function (ownerId) {
            return $http.get(`${BASE_URL}/owner/${ownerId}`)
                .then(response => response.data)
                .catch(error => errorService.handleError(error, 'ChatService :: Owner Conversations Fetch Failed'));
        };

        /**
         * @function getMessages()
         * @description Get all messages for a specific chatId.
         * @param {*} chatId 
         * @param {*} page 
         * @param {*} limit 
         * @returns resolved or rejected promise.
         */
        this.getMessages = function (chatId, page = 1, limit = 100) {
            return $http.get(`${BASE_URL}/messages/${chatId}?page=${page}&limit=${limit}`)
                .then(response => response.data)
                .catch(error => errorService.handleError(error, 'ChatService :: Messages Fetch Failed'));
        };

        /**
         * @function sendMessage()
         * @description Send a message in a specific chat.
         * @param {*} chatId 
         * @param {*} fromUser 
         * @param {*} toUser 
         * @param {*} message 
         * @param {*} file 
         * @returns resolved or rejected promise.
         */
        this.sendMessage = function (chatId, fromUser, toUser, message, file) {
            const messageData = {
                chatId,
                fromUser,
                toUser,
                message,
                attachment: file || null
            };
            return $http.post(`${BASE_URL}/messages/send`, messageData)
                .then(response => response.data)
                .catch(error => errorService.handleError(error, 'ChatService :: Message Send Failed'));
        };

        /**
         * @function createChat()
         * @description Create a new chat between a user and an owner for a specific car.
         * @param {*} carId 
         * @param {*} user 
         * @param {*} owner 
         * @returns resolved or rejected promise.
         */
        this.createChat = function (carId, user, owner) {
            const chatData = {
                carId,
                user,
                owner
            };

            return $http.post(`${BASE_URL}/create`, chatData)
                .then(response => response.data)
                .catch(error => errorService.handleError(error, 'ChatService :: Chat Creation Failed'));
        };

        /**
         * @function getOrCreateChat()
         * @description Get an existing chat or create a new one if it doesn't exist.
         * @param {*} carId 
         * @param {*} user 
         * @param {*} owner 
         * @returns resolved or rejected promise.
         */
        this.getOrCreateChat = function (carId, user, owner) {
            console.log("Chat Service :: ", carId, user, owner)
            return this.createChat(carId, user, owner)
                .then(chat => chat)
                .catch(error => errorService.handleError(error, 'ChatService :: Chat Get/Create Failed'));
        };

        /**
         * @function getChatParticipants()
         * @description Get participants of a specific chat.
         * @param {*} chatId 
         * @returns resolved or rejected promise.
         */
        this.getChatParticipants = function (chatId) {
            return $http.get(`${BASE_URL}/participants/${chatId}`)
                .then(response => response.data)
                .catch(error => errorService.handleError(error, 'ChatService :: Chat Participants Fetch Failed'));
        };

        /**
         * @function uploadFile()
         * @description Upload a file (placeholder for future implementation).
         * @param {*} file 
         * @returns resolved or rejected promise.
         */
        this.uploadFile = function (file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = () => reject('File upload failed');
                reader.readAsDataURL(file);
            });
        };

        /**
         * @function scrollToBottom()
         * @description Scroll to the bottom of the chat messages.
         */
        this.scrollToBottom = function () {
            $timeout(() => {
                const element = angular.element(document.querySelector('#chat-messages'));
                element.scrollTop = element.prop('scrollHeight');
            }, 100);
        };

        /**
 * Function :: getCarIdFromChatId
 * @param {string} chatId - The chat ID in the format "userId_ownerId_carId".
 * @returns {string} - The extracted car ID.
 */
        this.getCarIdFromChatId = function (chatId) {
            if (!chatId || typeof chatId !== 'string') {
                throw new Error('Invalid chatId');
            }
            const parts = chatId.split('_');
            if (parts.length < 3) {
                throw new Error('Invalid chatId format');
            }
            return parts[2]; // Return the carId (last part of the chatId)
        }
    }
]);