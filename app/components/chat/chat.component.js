mainApp.component('chatBox', {
    templateUrl: 'app/components/chat/chat.template.html',
    controller: ['$scope', '$timeout', 'chatService', 'errorService',
        function($scope, $timeout, chatService, errorService) {
            
            //Variable initialization
            let $ctrl = this;
            
            $ctrl.messages = [];        //Holds all the messages
            $ctrl.newMessage = '';      //New message object
            $ctrl.selectedFile = null;  //Selected file
            $ctrl.loading = false;      //Loader

            //Initialization function
            $ctrl.$onInit = function() {
                if (!$ctrl.chatId || !$ctrl.fromUser || !$ctrl.toUser) {
                    errorService.handleError('Missing required chat properties', 'ChatBox :: Initialization Failed');
                    return;
                }
                $ctrl.loadMessages();
            };

            //Load messages
            $ctrl.loadMessages = function() {
                $ctrl.loading = true;
                chatService.getMessages($ctrl.chatId)
                    .then(messages => {
                        //it ensures that this block is executed within angularjs's digest cycle, 
                        //which helps in properly updating the scope and bindings.
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

            //Send message
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

            //If the file size if greater than 5 MB throw error
            $ctrl.handleFileSelect = function(fileInput) {
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

            $ctrl.isOwnMessage = function(message) {
                return message.fromUser.userId === $ctrl.fromUser.userId;
            };


            //clear or fields when the component is getting destryoed
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