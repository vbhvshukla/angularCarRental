mainApp.component('chatBox', {
    templateUrl: 'app/components/chat/chat.template.html',
    controller: ['$scope', '$timeout', 'chatService', 'errorService',
        function($scope, $timeout, chatService, errorService) {
            let $ctrl = this;
            
            $ctrl.messages = [];
            $ctrl.newMessage = '';
            $ctrl.selectedFile = null;
            $ctrl.loading = false;

            $ctrl.$onInit = function() {
                if (!$ctrl.chatId || !$ctrl.fromUser || !$ctrl.toUser) {
                    errorService.handleError('Missing required chat properties', 'ChatBox :: Initialization Failed');
                    return;
                }
                $ctrl.loadMessages();
            };

            $ctrl.loadMessages = function() {
                $ctrl.loading = true;
                chatService.getMessages($ctrl.chatId)
                    .then(messages => {
                        $timeout(() => {
                            $ctrl.messages = messages;
                        });
                    })
                    .catch(error => errorService.handleError(error, 'ChatBox :: Messages Load Failed'))
                    .finally(() => {
                        $timeout(() => {
                            $ctrl.loading = false;
                        });
                    });
            };

            $ctrl.sendMessage = function() {
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
                .catch(error => errorService.handleError(error, 'ChatBox :: Message Send Failed'))
                .finally(() => {
                    $timeout(() => {
                        $ctrl.sending = false;
                    });
                });
            };

            $ctrl.handleFileSelect = function(fileInput) {
                const file = fileInput.files[0];
                if (file) {
                    if (file.size > 5 * 1024 * 1024) { // 5MB limit
                        errorService.handleError('File size must be less than 5MB', 'ChatBox :: File Validation');
                        fileInput.value = '';
                        return;
                    }
                    $timeout(() => {
                        $ctrl.selectedFile = file;
                    });
                }
            };

            $ctrl.isOwnMessage = function(message) {
                return message.fromUser.userId === $ctrl.fromUser.userId;
            };

            $ctrl.$onDestroy = function() {
                $ctrl.messages = [];
                $ctrl.selectedFile = null;
            };
        }
    ],
    controllerAs:'$ctrl',
    bindings: {
        chatId: '<',
        fromUser: '<',
        toUser: '<'
    }
});