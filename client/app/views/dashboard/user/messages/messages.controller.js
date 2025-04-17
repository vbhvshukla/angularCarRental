/** @file User Messages Page's Controller */

mainApp.controller('UserMessagesController', ['$state', 'userFactory', 'chatService',
    function ($state, userFactory, chatService) {
    
        /**Variable declaration */
        var vm = this;
        vm.messages = {};
        vm.loading = true;
        vm.searchQuery = '';
        vm.isSearching = false;

        /**
         * Function :: Initialization function
         * @function vm.init()
         * @desceription Get all the conversations of the user.
         * @requires async,userFactory,chatService
         */
        vm.init = function () {
            vm.loading = true;
            vm.searchQuery = '';
            
            //Stops if any one of the promises fail and callback is called immediately.
            async.waterfall([
                function (callback) {
                    userFactory.getCurrentUser()
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
                    console.log('Messages Controller :: Error Getting Conversations:', err);
                }
                else {
                    vm.messages = result.conversations;
                }
                vm.loading = false;
            });
        };

        /**
         * Function :: Search conversations
         * @function vm.searchConversations()
         * @description Search conversations by owner name
         */
        vm.searchConversations = function() {
            if (!vm.searchQuery.trim()) {
                // If search query is empty, load all conversations
                vm.init();
                return;
            }

            vm.loading = true;
            vm.isSearching = true;

            userFactory.getCurrentUser()
                .then(user => {
                    return chatService.searchUserConversation(user._id, vm.searchQuery);
                })
                .then(conversations => {
                    vm.messages = conversations;
                })
                .catch(error => {
                    console.log('Messages Controller :: Error Searching Conversations:', error);
                })
                .finally(() => {
                    vm.loading = false;
                });
        };

        //Function to redirect to the particular
        //message according to chatId.
        vm.goToMessagePage = function (chatId) {
            $state.go('userdashboard.message', { chatId: chatId });
        };
    }]);