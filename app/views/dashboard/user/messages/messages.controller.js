mainApp.controller('UserMessagesController', ['$state', 'authService', 'chatService',
    function ($state, authService, chatService) {
        var vm = this;

        //Holds messages and loading status
        vm.messages = {};
        vm.loading = true;

        //Initialization function for messages 
        //controller (Gets conversation as per
        //the current logged in user)

        vm.init = function () {
            authService.getUser()
                .then(user => {
                    if (!user) throw new Error('Messages Controller :: No User Found!');
                    return chatService.getUserConversations(user.userId);
                })
                .then(conversations => {
                    vm.messages = conversations;
                    vm.loading = false;
                })
                .catch(error => {
                    console.log('Messags Controller  :: Error Getting Conversations:', error);
                    vm.loading = false;
                }).finally(() => {
                    vm.loading = false;
                })
        }

        //Function to redirect to the particular
        //message according to chatId.
        vm.goToMessagePage = function (chatId) {
            $state.go('userdashboard.message', { chatId: chatId });
        };
    }]);