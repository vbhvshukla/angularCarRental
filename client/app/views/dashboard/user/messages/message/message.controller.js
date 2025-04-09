mainApp.controller('UserMessageController', ['$scope', '$q', '$timeout', '$stateParams', 'chatService', 'userFactory', 'carService', 'errorService', 'uploadService',
    function ($scope, $q, $timeout, $stateParams, chatService, userFactory, carService, errorService, uploadService) {

        //Variable declaration
        let vm = this;
        let socket = null;

        //Chat ID (Message/Conversation)
        vm.chatId = $stateParams.chatId;
        vm.messages = {};
        vm.newMessage = '';
        vm.selectedFile = null;
        vm.currentUser = null;
        vm.showModal = false;
        vm.modalImage = '';
        vm.isLoading = false;

        //Message Controller Inititialization Function 
        vm.init = function () {
            loadData();
            socket = io('http://127.0.0.1:8006');
            socket.emit('joinChat', vm.chatId);
            socket.on('newMessage', (message) => {
                if (message.chatId === vm.chatId) {
                    vm.messages.push(message);
                    $timeout()
                }
            });
        }

        //Fetch all the data
        function loadData() {
            async.waterfall([
                function (callback) {
                    userFactory.getCurrentUser()
                        .then(user => callback(null, user))
                        .catch((err) => callback(err));
                },
                function (user, callback) {
                    chatService.getMessages(vm.chatId)
                        .then(messages => callback(null, { messages, user }))
                        .catch((err) => callback(err));
                }
            ], function (err, results) {
                if (err) {
                    console.error('Message Controller :: Error loading data ::', err);
                }
                else {
                    vm.currentUser = results.user;
                    vm.messages = results.messages;
                    vm.scrollToBottom();
                }
            })
        }

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
            if (!vm.newMessage.trim() && !vm.selectedFile)
                return;

            vm.isLoading = true;

            //Get the carID
            const carId = chatService.getCarIdFromChatId(vm.chatId);

            //Fetch the car by carID.
            carService.getCarById(carId).then(car => {
                const toUser = {
                    _id: car.owner._id,
                    username: car.owner.username,
                    email: car.owner.email
                };

                const fromUser = {
                    _id: vm.currentUser._id,
                    username: vm.currentUser.username,
                    email: vm.currentUser.email
                };

                // Handle file upload if there is a file
                const uploadPromise = vm.selectedFile
                    ? uploadService.uploadFile(vm.selectedFile, vm.chatId, fromUser, toUser).then((res) => {
                        return {
                            attachmentId: res.newAttatchment._id,
                            url: res.fileUrl
                        };
                    }).catch((err) => {
                        errorService.handleError('Error uploading file', err);
                        return $q.reject(err);
                    })
                    : $q.resolve(null);

                return uploadPromise.then((attachment) => {
                    return chatService.sendMessage(
                        vm.chatId,
                        vm.currentUser,
                        car.owner,
                        vm.newMessage,
                        attachment
                    );
                });
            })
                .then(() => {
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
                    console.log("Message controller :: Error in sending message :: ", error);
                    errorService.handleError('Failed to send message', error);
                })
                .finally(() => {
                    vm.isLoading = false;
                });
        };

        vm.showImageModal = function (imageUrl) {
            vm.modalImage = imageUrl;
            vm.showModal = true;
        };

        vm.closeModal = function () {
            vm.showModal = false;
            vm.modalImage = '';
        };

        vm.downloadPdf = function (dataUrl, filename) {
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

        vm.scrollToBottom = function () {
            $timeout(() => {
                const chatMessages = document.getElementById('chat-messages');
                if (chatMessages) {
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                }
            }, 0);
        };

        $scope.$on('$destroy', function () {
            if (socket) {
                socket.disconnect();
            }
        });
    }
]);