mainApp.controller('OwnerAllChatsController', [
    '$scope', '$state', 'chatService', 'authService', 'errorService',
    function ($scope, $state, chatService, authService, errorService) {
        let vm = this;

        vm.loading = false;
        vm.conversations = [];
        vm.currentUser = null;

        vm.init = function () {
            vm.loading = true;

            authService.getUser()
                .then(user => {
                    vm.currentUser = user;
                    return chatService.getOwnerConversations(user._id);
                })
                .then(conversations => {
                    vm.conversations = conversations;
                })
                .catch(error => {
                    errorService.handleError('Failed to load conversations', error);
                })
                .finally(() => {
                    vm.loading = false;
                });
        };

        vm.goToChat = function (chatId) {
            $state.go('ownerdashboard.message', {
                chatId: chatId,
            });
        };
    }
]);