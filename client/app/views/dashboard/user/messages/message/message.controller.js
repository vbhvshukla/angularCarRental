mainApp.controller('UserMessageController', ['$scope', '$q', '$timeout', '$stateParams', 'chatService', 'authService', 'carService',
    function ($scope, $q, $timeout, $stateParams, chatService, authService, carService) {

        //Variable declaration
        let vm = this;
        let socket = null;

        //Chat ID (Message/Conversation)
        vm.chatId = $stateParams.chatId;
        vm.messages = {};
        vm.newMessage = '';
        vm.selectedFile = null;
        vm.currentUser = null;


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
                    authService.getUser()
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
                }
            })

        }

        $scope.handleFileSelect = function (files) {
            vm.selectedFile = files[0];
        };


        vm.sendMessage = function () {

            if (!vm.newMessage.trim() && !vm.selectedFile)
                return;

            //Get the carID
            const carId = chatService.getCarIdFromChatId(vm.chatId);

            const formData = new FormData();

            

            //Fetch the car by carID.
            carService.getCarById(carId).then(car => {
                return chatService.sendMessage(
                    vm.chatId,
                    vm.currentUser,
                    car.owner,
                    vm.newMessage,
                    vm.selectedFile
                );
            })
                .then(() => {
                    vm.newMessage = '';
                    vm.selectedFile = null;
                    vm.fileInput = null;
                    return chatService.getMessages(vm.chatId);
                })
                .then((messages) => {
                    vm.messages = messages;
                })
                .catch((error) => {
                    console.log("Message controller :: Error in sending message :: ", error);
                })
        };

        vm.downloadPdf = function (dataUrl, filename) {
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

        $scope.$on('$destroy', function () {
            if (socket) {
                socket.disconnect();
            }
        });
    }
]);