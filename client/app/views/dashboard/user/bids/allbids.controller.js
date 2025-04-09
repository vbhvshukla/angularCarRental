/** @file User Dashboard's Bid Page's Controller */

mainApp.controller('UserBidsController', ['$state', 'bidService', 'userFactory', 'chatService', 'errorService',
    function ($state, bidService, userFactory, chatService, errorService) {

        /** Variable declaration */
        let vm = this;
        vm.bids = [];
        vm.filteredBids = [];
        vm.paginatedBids = [];
        vm.filters = {
            rentalType: '',
            status: ''
        };

        // Pagination variables
        vm.currentPage = 1;
        vm.itemsPerPage = 5;

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
         * @description Get the user logged in -> Fetch its bids.
         * @requires async,userFactory,bidService
         */

        function loadUserBids() {
            async.waterfall([
                function (callback) {
                    userFactory.getCurrentUser()
                        .then(user => callback(null, user))
                        .catch(err => callback(err));
                },
                function (user, callback) {
                    bidService.getBidsByUser(user._id)
                        .then(bids => callback(null, { bids }))
                        .catch(err => callback(err));
                }
            ], function (err, results) {
                if (err) {
                    console.error('Error Getting Bids:', err);
                } else {
                    vm.bids = results.bids;
                    vm.filterBids();
                }
            });
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
            vm.updatePagination();
        };

        /**
         * Function :: Update Pagination
         * @function updatePagination()
         * @description Updates the paginated bids based on the current page and items per page.
         */

        vm.updatePagination = function () {
            const start = (vm.currentPage - 1) * vm.itemsPerPage;
            const end = start + vm.itemsPerPage;
            vm.paginatedBids = vm.filteredBids.slice(start, end);
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
                bidService.updateBidStatus(bid._id, 'cancelled')
                    .then(function () {
                        vm.filterBids();
                    })
                    .catch(function (error) {
                        console.error('Error Cancelling Bids', error);
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