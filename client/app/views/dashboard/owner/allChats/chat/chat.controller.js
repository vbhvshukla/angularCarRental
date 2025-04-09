mainApp.controller('OwnerChatController', [
    '$scope', '$timeout', '$q', '$stateParams', 'chatService', 'userFactory', 'errorService', 'uploadService',
    function ($scope, $timeout, $q, $stateParams, chatService, userFactory, errorService, uploadService) {
        let vm = this;
        let socket = null;

        // Initialize variables
        vm.chatId = $stateParams.chatId;
        vm.messages = [];
        vm.newMessage = '';
        vm.selectedFile = null;
        vm.currentUser = null;
        vm.showModal = false;
        vm.modalImages = [];
        vm.isLoading = false;
        vm.media = null;

        vm.init = function () {
            vm.loading = true;
            socket = io('http://127.0.0.1:8006');
            socket.emit('joinChat', vm.chatId);
            socket.on('newMessage', (message) => {
                if (message.chatId === vm.chatId) {
                    vm.messages.push(message);
                    $timeout();
                }
            });

            $q.all([
                userFactory.getCurrentUser(), // Use userFactory to fetch the current user
                chatService.getMessages(vm.chatId)
            ])
                .then(([user, messages]) => {
                    vm.currentUser = user;
                    vm.messages = messages;
                    vm.scrollToBottom();
                })
                .catch(error => {
                    errorService.handleError('Failed to load chat', error);
                })
                .finally(() => {
                    vm.loading = false;
                });
        };

        vm.getMedia = function () {
            return chatService.getAllMedia(vm.chatId).then((response) =>
             response);
        }

        $scope.$on('$destroy', function () {
            if (socket) {
                socket.disconnect();
            }
        });

        vm.handleFileSelect = function (files) {
            if (files && files.length) {
                vm.selectedFile = files[0];
                if (vm.selectedFile.size > 5000000) {
                    errorService.handleError('File is too large. Maximum size is 5MB');
                    vm.selectedFile = null;
                    vm.fileInput = null;
                }
            }
        };

        vm.sendMessage = function () {
            if (!vm.newMessage.trim() && !vm.selectedFile) return;

            vm.isLoading = true;

            // First get the participants
            chatService.getChatParticipants(vm.chatId)
                .then((participants) => {
                    const toUser = {
                        _id: participants.user.userId,
                        username: participants.user.username,
                        email: participants.user.email
                    };

                    const fromUser = {
                        _id: vm.currentUser._id,
                        username: vm.currentUser.username,
                        email: vm.currentUser.email
                    };


                    // Now handle file upload if there is a file
                    const uploadPromise = vm.selectedFile
                        ? uploadService.uploadFile(vm.selectedFile, vm.chatId, fromUser, toUser).then((res) => {
                            console.log('Upload promise response :: ', res);
                            return {
                                attachmentId: res.newAttatchment._id,
                                url: res.fileUrl
                            };
                        }).catch((err) => {
                            errorService.handleError('Error uploading file', err);
                            return $q.reject(err);
                        })
                        : $q.resolve(null);

                    // Return both the upload result and the participants
                    return uploadPromise.then((attachment) => {
                        return { attachment, participants };
                    });
                })
                .then(({ attachment, participants }) => {
                    return chatService.sendMessage(
                        vm.chatId,
                        vm.currentUser,
                        {
                            _id: participants.user.userId,
                            username: participants.user.username,
                            email: participants.user.email
                        },
                        vm.newMessage,
                        attachment
                    );
                })
                .then(() => {
                    // Reset the input fields
                    vm.newMessage = '';
                    vm.selectedFile = null;
                    vm.fileInput = null;
                    return chatService.getMessages(vm.chatId);
                })
                .then((messages) => {
                    vm.messages = messages;
                    vm.scrollToBottom();
                })
                .catch((error) => {
                    errorService.handleError('Failed to send message', error);
                })
                .finally(() => {
                    vm.isLoading = false;
                });
        };

        vm.showImageModal = function () {
            vm.modalImages = vm.getMedia();
            vm.showModal = true;
        };

        vm.downloadPdf = function (dataUrl, filename) {
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

        vm.closeModal = function () {
            vm.showModal = false;
            vm.modalImage = '';
        };

        vm.scrollToBottom = function () {
            $timeout(() => {
                const chatMessages = document.getElementById('chat-messages');
                if (chatMessages) {
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                }
            }, 0);
        };

    }
]);