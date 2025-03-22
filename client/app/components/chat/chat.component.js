mainApp.component('chatBox', {
    
    templateUrl: 'app/components/chat/chat.template.html',
    
    controller: ['$scope', '$timeout', 'chatService', 'errorService',
    
        function ($scope, $timeout, chatService, errorService) {

            /**
             * Variable Declarations
             * @var $ctrl Alias for view modal in this component.
             * @var $ctrl.messages Array of fetched messages.
             * @var $ctrl.newMessage Object of the new message to be sent.
             */

            let $ctrl = this;
            $ctrl.messages = [];
            $ctrl.newMessage = '';
            $ctrl.selectedFile = null;
            $ctrl.loading = false;

            /**
             * Initialization function
             * Check and call loadMessages function.
             * @return {void}
             */

            $ctrl.$onInit = function () {
                if (!$ctrl.chatId || !$ctrl.fromUser || !$ctrl.toUser) {
                    errorService.handleError('ChatBox :: Initialization Failed ::  Missing required chat properties');
                    return;
                }
                $ctrl.loadMessages();
            };

            /**
             * Load Messages function
             * @requires chatService
             * @description Loads all the messages associated with the ChatId into @var $ctrl.messages
             */

            $ctrl.loadMessages = function () {
                $ctrl.loading = true;
                chatService.getMessages($ctrl.chatId)
                    .then(messages => {
                        $timeout(() => $ctrl.messages = messages);
                    })
                    .catch(error => errorService.handleError(error, 'ChatBox :: Messages Load Failed'))
                    .finally(() => $timeout(() => $ctrl.loading = false));
            };

            /**
             * Send Messages function
             * @requires chatService
             * @description calls chatService.sendMessage with the message object and loads the messages again.
             */

            $ctrl.sendMessage = function () {
                if (!$ctrl.newMessage && !$ctrl.selectedFile) return;
                $ctrl.sending = true;
                chatService.sendMessage(
                    $ctrl.chatId,
                    $ctrl.fromUser,
                    $ctrl.toUser,
                    $ctrl.newMessage,
                    $ctrl.selectedFile
                )
                    .then(() => {
                        $timeout(() => {
                            $ctrl.newMessage = '';
                            $ctrl.selectedFile = null;
                        });
                        return $ctrl.loadMessages();
                    })
                    .catch(error => errorService.handleError(error, 'Chat Component :: Message Send Failed'))
                    .finally(() => $ctrl.sending = false);
            };

            /**
             * Handle file selection function
             * @requires errorService
             * @description Checks if the file size is greater than defined file size limit(5MB) and attatches it to @var $ctrl.selectedFile.
             */

            $ctrl.handleFileSelect = function (fileInput) {
                const file = fileInput.files[0];
                if (file) {
                    if (file.size > 5 * 1024 * 1024) {
                        errorService.handleError('File size must be less than 5MB', 'ChatBox :: File Validation');
                        fileInput.value = '';
                        return;
                    }
                    $timeout(() => {
                        $ctrl.selectedFile = file;
                    });
                }
            };

            /**
             * Helper function 
             * @returns Boolean
             * @description For checking if the message is of user's or the opposite person.
             */

            $ctrl.isOwnMessage = function (message) {
                return message.fromUser._id === $ctrl.fromUser._id;
            };

            /**
             * Clear the memory of @var $ctrl.messages & @var $ctrl.selectedFile
             */
            
            $ctrl.$onDestroy = function () {
                $ctrl.messages = [];
                $ctrl.selectedFile = null;
            };
        }
    ],
    controllerAs: '$ctrl',
    bindings: {
        chatId: '<',
        fromUser: '<',
        toUser: '<'
    }
});