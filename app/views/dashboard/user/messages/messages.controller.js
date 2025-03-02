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
            //Stops if any one of the promises fail and callback is called immediately.
            async.waterfall([
                function (callback) {
                    authService.getUser()
                        .then(user => callback(null, user))
                        .catch((err) => callback(err));

                },
                function (user, callback) {
                    chatService.getUserConversations(user.userId)
                        .then(conversations => callback(null, { conversations, user }))
                        .catch((err) => callback(err));
                }
            ], function (err, result) {
                if (err) {
                    console.log('Messags Controller  :: Error Getting Conversations:', err);
                }
                else {
                    vm.messages = result.conversations;
                }
                vm.loading = false;

            })

        }

        //Function to redirect to the particular
        //message according to chatId.
        vm.goToMessagePage = function (chatId) {
            $state.go('userdashboard.message', { chatId: chatId });
        };
    }]);