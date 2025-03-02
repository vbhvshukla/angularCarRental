mainApp.service('chatService', ['$q', 'dbService', 'errorService', '$timeout',
    function ($q, dbService, errorService, $timeout) {

        function generateChatId(userId, ownerId, carId) {
            return `${userId}_${ownerId}_${carId}`;
        }

        this.getUserConversations = function (userId) {
            return dbService.getAllItemsByIndex('conversations', 'userId', userId)
                .then(conversations => {
                    return conversations.sort((a, b) =>
                        new Date(b.lastTimestamp) - new Date(a.lastTimestamp)
                    );
                })
                .catch(error => errorService.handleError(error, 'ChatService :: User Conversations Fetch Failed'));
        };

        this.getOwnerConversations = function (ownerId) {
            return dbService.getAllItemsByIndex('conversations', 'ownerId', ownerId)
                .then(conversations => {
                    return conversations.sort((a, b) =>
                        new Date(b.lastTimestamp) - new Date(a.lastTimestamp)
                    );
                })
                .catch(error => errorService.handleError(error, 'ChatService :: Owner Conversations Fetch Failed'));
        };

        this.getMessages = function (chatId) {
            return dbService.getAllItemsByIndex('messages', 'chatId', chatId)
                .then(messages => messages.sort((a, b) =>
                    new Date(a.createdAt) - new Date(b.createdAt)))
                .catch(error => errorService.handleError(error, 'ChatService :: Messages Fetch Failed'));
        };

        this.sendMessage = function (chatId, fromUser, toUser, message, file) {
            const messageData = {
                messageId: Date.now().toString(),
                chatId: chatId,
                message: message || '',
                hasAttachment: !!file,
                attachment: null,
                createdAt: new Date().toISOString(),
                fromUser: {
                    userId: fromUser.userId,
                    username: fromUser.username,
                    email: fromUser.email
                },
                toUser: {
                    userId: toUser.userId,
                    username: toUser.username,
                    email: toUser.email
                }
            };

            let messagePromise;
            if (file) {
                messagePromise = this.uploadFile(file)
                    .then(fileUrl => {
                        messageData.attachment = fileUrl;
                        return dbService.addItem('messages', messageData);
                    });
            } else {
                messagePromise = dbService.addItem('messages', messageData);
            }

            return messagePromise
                .then(() => this.updateConversation(chatId, message, fromUser, toUser))
                .catch(error => errorService.handleError(error, 'ChatService :: Message Send Failed'));
        };

        this.sendOwnerMessage = function (chatId, fromOwner, toUser, message, file) {
            const messageData = {
                messageId: Date.now().toString(),
                chatId: chatId,
                message: message || '',
                hasAttachment: !!file,
                attachment: null,
                createdAt: new Date().toISOString(),
                fromUser: {
                    userId: fromOwner.userId,
                    username: fromOwner.username,
                    email: fromOwner.email
                },
                toUser: {
                    userId: toUser.userId,
                    username: toUser.username,
                    email: toUser.email
                }
            };

            let messagePromise;
            if (file) {
                messagePromise = this.uploadFile(file)
                    .then(fileUrl => {
                        messageData.attachment = fileUrl;
                        return dbService.addItem('messages', messageData);
                    });
            } else {
                messagePromise = dbService.addItem('messages', messageData);
            }

            return messagePromise
                .then(() => this.updateOwnerConversation(chatId, message, fromOwner, toUser))
                .catch(error => errorService.handleError(error, 'ChatService :: Owner Message Send Failed'));
        };

        this.createChat = function (carId, user, owner) {
            const chatId = generateChatId(user.userId, owner.userId, carId);

            const conversation = {
                chatId: chatId,
                carId: carId,
                lastMessage: '',
                lastTimestamp: new Date().toISOString(),
                owner: {
                    userId: owner.userId,
                    username: owner.username,
                    email: owner.email
                },
                user: {
                    userId: user.userId,
                    username: user.username,
                    email: user.email
                }
            };

            return dbService.addItem('conversations', conversation)
                .then(() => conversation)
                .catch(error => errorService.handleError(error, 'ChatService :: Chat Creation Failed'));
        };

        this.getOrCreateChat = function (carId, user, owner) {
            const chatId = generateChatId(user.userId, owner.userId, carId);

            return dbService.getItemByKey('conversations', chatId)
                .then(conversation => {
                    if (conversation) return conversation;
                    return this.createChat(carId, user, owner);
                })
                .catch(error => errorService.handleError(error, 'ChatService :: Chat Get/Create Failed'));
        };

        this.updateConversation = function (chatId, message, fromUser, toUser) {
            return dbService.getItemByKey('conversations', chatId)
                .then(conversation => {
                    conversation.lastMessage = message;
                    conversation.lastTimestamp = new Date().toISOString();
                    return dbService.updateItem('conversations', conversation);
                })
                .catch(error => errorService.handleError(error, 'ChatService :: Conversation Update Failed'));
        };

        this.updateOwnerConversation = function (chatId, message, fromOwner, toUser) {
            return dbService.getItemByKey('conversations', chatId)
                .then(conversation => {
                    if (!conversation) {
                        return $q.reject('Conversation not found');
                    }
                    conversation.lastMessage = message;
                    conversation.lastTimestamp = new Date().toISOString();
                    conversation.owner = {
                        userId: fromOwner.userId,
                        username: fromOwner.username,
                        email: fromOwner.email
                    };
                    conversation.user = {
                        userId: toUser.userId,
                        username: toUser.username,
                        email: toUser.email
                    };
                    return dbService.updateItem('conversations', conversation);
                })
                .catch(error => errorService.handleError(error, 'ChatService :: Owner Conversation Update Failed'));
        };

        this.uploadFile = function (file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = () => reject('File upload failed');
                reader.readAsDataURL(file);
            });
        };

        this.getCarIdFromChatId = function (chatId) {
            const parts = chatId.split('_');
            return parts[parts.length - 1];
        }

        this.scrollToBottom = function () {
            $timeout(() => {
                const element = angular.element(document.querySelector('#chat-messages'));
                element.scrollTop = element.prop('scrollHeight');
            }, 100);
        }

        this.getChatParticipants = function (chatId) {
            return dbService.getItemByKey('conversations', chatId)
                .then(conversation => {
                    if (!conversation) {
                        return $q.reject('Conversation not found');
                    }
                    return {
                        owner: conversation.owner,
                        user: conversation.user
                    };
                })
                .catch(error => errorService.handleError(error, 'ChatService :: Chat Participants Fetch Failed'));
        };
    }
]);