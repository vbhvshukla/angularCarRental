mainApp.controller('UserMessageController', ['$scope', '$q', '$stateParams', 'chatService', 'authService', 'carService',
    function ($scope, $q, $stateParams, chatService, authService, carService) {

        //Variable declaration
        let vm = this;

        //Chat ID (Message/Conversation)
        vm.chatId = $stateParams.chatId;
        vm.messages = {};
        vm.newMessage = '';
        vm.selectedFile = null;
        vm.currentUser = null;


        //Message Controller Inititialization Function 
        vm.init = function () {
            loadData();
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

            if (!vm.newMessage.trim() && !vm.selectedFile) return;

            //Get the carID
            const carId = chatService.getCarIdFromChatId(vm.chatId);

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
                //Clear the Input Fields
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

        vm.downloadPdf = function(dataUrl, filename) {
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };
    }
]);