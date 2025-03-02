mainApp.controller('OwnerChatController', [
    '$scope', '$q', '$stateParams', 'chatService', 'authService', 'errorService',
    function ($scope, $q, $stateParams, chatService, authService, errorService) {
        let vm = this;

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
            
            $q.all([
                authService.getUser(),
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

        vm.handleFileSelect = function(files) {
            if (files && files.length) {
                vm.selectedFile = files[0];
                if (vm.selectedFile.size > 5000000) {
                    errorService.handleError('File is too large. Maximum size is 5MB');
                    vm.selectedFile = null;
                    vm.fileInput = null;
                }
            }
        };

        vm.sendMessage = function() {
            if (!vm.newMessage.trim() && !vm.selectedFile) return;

            chatService.getChatParticipants(vm.chatId)
                .then(participants => {
                    return chatService.sendOwnerMessage(
                        vm.chatId,
                        vm.currentUser,
                        participants.user,
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

        vm.showImageModal = function(imageUrl) {
            vm.modalImage = imageUrl;
            vm.showModal = true;
        };

        vm.closeModal = function() {
            vm.showModal = false;
            vm.modalImage = '';
        };
    }
]);