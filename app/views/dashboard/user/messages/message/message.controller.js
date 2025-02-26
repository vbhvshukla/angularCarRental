mainApp.controller('UserMessageController', ['$scope', '$q', '$stateParams', 'chatService', 'authService', 'carService',
    function ($scope, $q, $stateParams, chatService, authService, carService) {

        //Variable initialization
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
            //Return chatService only when the authService gets resolved.
            authService.getUser()
                .then(user => {
                    vm.currentUser = user;
                    return chatService.getMessages(vm.chatId);
                })
                .then(messages => {
                    vm.messages = messages;
                    chatService.scrollToBottom();
                })
                .catch(error => {
                    console.error('Error loading data:', error);
                });
        }

        //File handler
        $scope.handleFileSelect = function (files) {
            vm.selectedFile = files[0];
        };

        //Send Message
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
    }
]);