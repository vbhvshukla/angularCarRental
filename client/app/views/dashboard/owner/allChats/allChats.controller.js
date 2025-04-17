mainApp.controller('OwnerAllChatsController', [
    '$scope', '$state', 'chatService', 'userFactory', 'errorService', '$uibModal',
    function ($scope, $state, chatService, userFactory, errorService, $uibModal) {
        let vm = this;

        vm.loading = false;
        vm.conversations = [];
        vm.currentUser = null;
        vm.searchQuery = '';
        vm.isSearching = false;

        vm.init = function () {
            vm.loading = true;
            vm.searchQuery = '';

            userFactory.getCurrentUser()
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

        vm.searchConversations = function() {
            if (!vm.searchQuery.trim()) {
                // If search query is empty, load all conversations
                vm.init();
                return;
            }

            vm.loading = true;
            vm.isSearching = true;

            chatService.searchOwnerConversation(vm.currentUser._id, vm.searchQuery)
                .then(conversations => {
                    vm.conversations = conversations;
                })
                .catch(error => {
                    errorService.handleError('Failed to search conversations', error);
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