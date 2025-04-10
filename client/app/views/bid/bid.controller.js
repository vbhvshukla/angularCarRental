/** @file Bidding Controller */

mainApp.controller('BiddingController', [
    '$scope', '$state', '$stateParams', 'carService', 'chatService',
    'userFactory', 'errorService', 'bidService',
    function ($scope, $state, $stateParams, carService, chatService,
        userFactory, errorService, bidService) {

        /**
         * Variable declarations
         */

        let vm = this;                  //Global variable holds all functions of controller
        vm.car = null;                  //Holds the particular car's object.
        vm.currentUser = null;          //Holds the currently logged in user's object.
        vm.chatId = null;               //Holds the chatId from the Url Parameters.
        vm.showPriceInfoModal = false;  //Boolean for displaying or hiding price modal.
        vm.loading = true;              //Boolean for loader.

        /**
         * Initialization function
         * @function vm.init()
         * @description This function is called when the controller is initialized 
         * initializes the global variables @var vm.car , @var vm.currentUser.
         * @requires async library
         */

        vm.init = function () {
            vm.loading = true;
            //Tasks list to be fetched parallely.
            const tasks = [
                userFactory.getCurrentUser(), //Gets the details of the currently logged in user.
                carService.getCarById($stateParams.carId) //Gets the params passed in the url.
            ];

            //Results hold the response of all the tasks in async.queue's 'q'.
            let results = [];

            let q = async.queue((task, completed) => {
                task.then((res) => {
                    completed(null, res);
                })
                    .catch((err) => {
                        completed(err);
                    });
            }, 1);

            //Push all the available tasks in the async.queue.

            tasks.forEach((task) => {
                q.push(task, (err, result) => {
                    if (err) {
                        console.log("Error in task :: ", err);
                    } else {
                        results.push(result);
                    }
                });
            });

            //If anyone of the task throws an error log it.
            q.error((task, error) => {
                console.log("Error in task :: ", task, error);
            });

            //Once all the tasks are completed in the async.queue 'q'. This will get executed.
            q.drain(() => {
                const [user, car] = results;

                vm.currentUser = user;
                vm.car = car;

                if (!vm.car || !vm.currentUser) {
                    errorService.handleError('BiddingController  :: Missing required :: Init Failed');
                    return $state.go('home');
                }
                chatService.getOrCreateChat(vm.car._id, vm.currentUser, vm.car.owner)
                    .then(chat => {
                        vm.chatId = chat.chatId;
                        return chat;
                    })
                    .catch(error => {
                        errorService.handleError(error, 'BiddingController :: Chat Init Failed');
                        return;
                    }).finally(() => vm.loading = false);
            });

        }

        /**
         * Handling bid submission.
         * @param {*} bid 
         * @description performs validations and submits it to the DB.
         * @requires bidService
         */

        vm.handleBidSubmit = function (bid) {
            console.log(bid);
            if (vm.isSubmitting) return;



            if (!bid || !bid.bidAmount || !bid.startDate || !bid.endDate || !bid.rentalType) {
                errorService.handleError('Invalid bid data', 'BiddingController :: Bid Validation');
                return;
            }

            vm.isSubmitting = true;

            bidService.submitBid(vm.car._id, bid, vm.currentUser)
                .then(() => {
                    errorService.logSuccess('Bid submitted successfully!', 'BiddingController :: Bid');
                    const message = `New bid placed :: ${vm.car.carName} : ${bid.rentalType} rental from ${new Date(bid.startDate).toLocaleDateString()} to ${new Date(bid.endDate).toLocaleDateString()} Price : ${bid.bidAmount}`;
                    return chatService.sendMessage(vm.chatId, vm.currentUser, vm.car.owner, message);
                })
                .then(() => {
                    $state.go('userdashboard.bids');
                })
                .catch(error => {
                    errorService.handleError(error, 'BiddingController :: Bid Failed');
                })
                .finally(() => {
                    vm.isSubmitting = false;
                });
        };


        /**
         * Below functions are no longer in use.
         */

        vm.showPriceInfo = function () {
            vm.showPriceInfoModal = true;
        };

        vm.closePriceInfo = function () {
            vm.showPriceInfoModal = false;
        };

    }
]);