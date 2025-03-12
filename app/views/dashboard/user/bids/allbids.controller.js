/** @file User Dashboard's Bid Page's Controller */

mainApp.controller('UserBidsController', ['$state', 'bidService', 'authService', 'chatService', 'errorService',
    function ($state, bidService, authService, chatService, errorService) {

        /** Variable declaration */
        let vm = this;
        vm.bids = {};
        vm.filteredBids = {};
        vm.filters = {
            rentalType: '',
            status: ''
        };
        vm.chatId = "";


        /**
         * Function :: Initialization
         * @description Initializes the bids of the user.
         */

        vm.init = function () {
            loadUserBids();
        };

        /**
         * Function :: Load User's Bids
         * @function loadUserBids()
         * @description Get the user logged in -> Fetch it's bids.
         * @requires async,authService,bidService
         */

        function loadUserBids() {
            async.waterfall([
                function (callback) {
                    authService.getUser()
                        .then(user => callback(null, user))
                        .catch(err => callback(err));
                },
                function (user, callback) {
                    bidService.getBidsByUser(user.userId)
                        .then(bids => callback(null, { bids }))
                        .catch(err => callback(err));
                }

            ], function (err, results) {
                if (err) {
                    console.error('User Dashboard :: All Bids Controller :: Error Getting Bids :: ', err);
                }
                else {
                    vm.bids = results.bids;
                    vm.filterBids();
                }
            })
        }

        /**
         * Function :: Filter Bids(by rental type)
         * @function filterBids()
         * @description Filters bids based on rental type.
         */

        vm.filterBids = function () {
            vm.filteredBids = vm.bids.filter(function (bid) {
                let matchRentalType = true;
                let matchStatus = true;
                if (vm.filters.rentalType) {
                    matchRentalType = bid.rentalType === vm.filters.rentalType;
                }
                if (vm.filters.status) {
                    matchStatus = bid.status === vm.filters.status;
                }
                return matchRentalType && matchStatus;
            });
        };

        /**
         * Function :: Cancel A Bid
         * @function vm.cancelBid()
         * @param {*} bid 
         * @description Cancel bid
         * @requires bidService
         */

        vm.cancelBid = function (bid) {
            if (bid.status === 'pending') {
                bid.status = 'cancelled';
                bidService.updateBidStatus(bid.bidId, 'cancelled')
                    .then(function () {
                        vm.filterBids();
                    })
                    .catch(function (error) {
                        console.error('User Dashboard :: All Bids Controller :: Error Cancelling Bids', error);
                        bid.status = 'pending';
                    });
            }
        };

        /**
         * Function :: Redirect to Message's Page
         * @function vm.goToMessagePage()
         * @param {*} bid 
         * @requires chatService
         */

        vm.goToMessagePage = function (bid) {
            chatService.getOrCreateChat(bid.car.carId, bid.user, bid.car.owner)
                .then(function (conversation) {
                    $state.go('userdashboard.message', {
                        chatId: conversation.chatId
                    });
                })
                .catch(function (error) {
                    errorService.handleError(error, 'Failed to open chat');
                });
        };

        /**
         * Function :: Format Date to Locale String
         * @param {*} date 
         * @function vm.formatDate()
         */

        vm.formatDate = function (date) {
            return new Date(date).toLocaleDateString();
        };
    }
]);