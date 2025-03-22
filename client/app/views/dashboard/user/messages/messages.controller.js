/** @file User Messages Page's Controller */

mainApp.controller('UserMessagesController', ['$state', 'authService', 'chatService',
    function ($state, authService, chatService) {
    
        /**Variable declaration */
        var vm = this;
        vm.messages = {};
        vm.loading = true;

        /**
         * Function :: Initialization function
         * @function vm.init()
         * @desceription Get all the conversations of the user.
         * @requires async,authService,chatService
         */

        vm.init = function () {
            //Stops if any one of the promises fail and callback is called immediately.
            async.waterfall([
                function (callback) {
                    authService.getUser()
                        .then(user => callback(null, user))
                        .catch((err) => callback(err));

                },
                function (user, callback) {
                    chatService.getUserConversations(user._id)
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