mainApp.controller('OwnerChatController', [
    '$scope', '$timeout', '$q', '$stateParams', 'chatService', 'userFactory', 'errorService',
    function ($scope, $timeout, $q, $stateParams, chatService, userFactory, errorService) {
        let vm = this;
        let socket = null;

        // Initialize variables
        vm.chatId = $stateParams.chatId;
        vm.messages = [];
        vm.newMessage = '';
        vm.selectedFile = null;
        vm.currentUser = null;
        vm.showModal = false;
        vm.modalImage = '';

        vm.init = function () {
            vm.loading = true;
            socket = io('http://127.0.0.1:8006'); 
            socket.emit('joinChat', vm.chatId);
            socket.on('newMessage', (message) => {
                if (message.chatId === vm.chatId) {
                    vm.messages.push(message);
                    $timeout();
                }
            });

            $q.all([
                userFactory.getCurrentUser(), // Use userFactory to fetch the current user
                chatService.getMessages(vm.chatId)
            ])
                .then(([user, messages]) => {
                    vm.currentUser = user;
                    vm.messages = messages;
                    chatService.scrollToBottom();
                })
                .catch(error => {
                    errorService.handleError('Failed to load chat', error);
                })
                .finally(() => {
                    vm.loading = false;
                });
        };

        $scope.$on('$destroy', function () {
            if (socket) {
                socket.disconnect();
            }
        });

        vm.handleFileSelect = function (files) {
            if (files && files.length) {
                vm.selectedFile = files[0];
                if (vm.selectedFile.size > 5000000) {
                    errorService.handleError('File is too large. Maximum size is 5MB');
                    vm.selectedFile = null;
                    vm.fileInput = null;
                }
            }
        };

        vm.sendMessage = function () {
            if (!vm.newMessage.trim() && !vm.selectedFile) return;
            chatService.getChatParticipants(vm.chatId)
                .then(participants => {
                    return chatService.sendMessage(
                        vm.chatId,
                        vm.currentUser,
                        {
                            _id: participants.user.userId,
                            username: participants.user.username,
                            email: participants.user.email
                        },
                        vm.newMessage,
                        vm.selectedFile
                    );
                })
                .then(() => {
                    vm.newMessage = '';
                    vm.selectedFile = null;
                    vm.fileInput = null;
                    return chatService.getMessages(vm.chatId);
                })
                .then(messages => {
                    vm.messages = messages;
                    chatService.scrollToBottom();
                })
                .catch(error => {
                    errorService.handleError('Failed to send message', error);
                });
        };

        vm.showImageModal = function (imageUrl) {
            vm.modalImage = imageUrl;
            vm.showModal = true;
        };

        vm.downloadPdf = function (dataUrl, filename) {
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

        vm.closeModal = function () {
            vm.showModal = false;
            vm.modalImage = '';
        };
    }
]);