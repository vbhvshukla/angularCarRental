/** @file Owner Dashboard's Home Controller */

mainApp.controller('OwnerHomeDashboardController', [
    'bidService', 'authService', 'bookingService', 'errorService', 'chatService', '$uibModal',
    function (bidService, authService, bookingService, errorService, chatService, $uibModal) {

        /**
         * Variable declaration
         */
        let vm = this;
        vm.pagination = {
            bookings: {
                currentPage: 1,
                itemsPerPage: 5,
                totalItems: 0
            },
            allBids: {
                currentPage: 1,
                itemsPerPage: 5,
                totalItems: 0
            },
            pendingBids: {
                currentPage: 1,
                itemsPerPage: 5,
                totalItems: 0
            }
        };
        vm.extras = {
            extraKm: 0,
            extraHr: 0,
            extraDay: 0,
        };
        vm.bookingData = null;
        vm.allBids = [];     // Holds all the bids for the owner
        vm.bookings = [];    // Holds all the bookings of owner's cars
        vm.pendingBids = []; // Holds all the pending bids
        vm.filteredBookings = [];
        vm.filteredAllBids = [];
        vm.filteredPendingBids = [];
        vm.filters = {
            bookingType: 'all',
            bidStatus: 'all',
            pendingType: 'all'
        };

        /**
         * Function :: Initialization
         * @function vm.init()
         * @description Loads the user and fetches all data.
         * @requires authService
         */
        vm.init = function () {
            authService.getUser()
                .then(user => vm.getAllData(user.userId))
                .catch(err => console.error("Owner controller :: Error Getting User :: ", err));
        };

        /**
         * Function :: Get All Data
         * @param {*} userId 
         * @description Fetches all bookings and bids for the current logged-in user.
         * @requires bookingService, bidService
         */
        vm.getAllData = function (userId) {
            async.parallel([
                function (callback) {
                    bookingService.getBookingsForOwner(userId, vm.pagination.bookings.currentPage, vm.pagination.bookings.itemsPerPage)
                        .then(result => {
                            vm.bookings = result.bookings;
                            vm.pagination.bookings.totalItems = result.totalItems;
                            callback(null, result.bookings);
                        })
                        .catch(err => callback(err));
                },
                function (callback) {
                    bidService.getBidsForOwner(userId, vm.pagination.allBids.currentPage, vm.pagination.allBids.itemsPerPage)
                        .then(result => {
                            vm.allBids = result.bids;
                            vm.pagination.allBids.totalItems = result.totalItems;
                            vm.pendingBids = vm.allBids.filter(bid => bid.status.toLowerCase() === 'pending');
                            callback(null, result.bids);
                        })
                        .catch(err => callback(err));
                }
            ], function (err) {
                if (err) {
                    console.error("Owner dashboard :: Error Getting All Data :: ", err);
                } else {
                    vm.applyFilters();
                }
            });
        };

        /**
         * Function :: Apply Filters
         * @description Applies filters to the bookings and bids.
         */
        vm.applyFilters = function () {
            vm.filteredBookings = vm.bookings.filter(booking =>
                vm.filters.bookingType === 'all' || booking.rentalType === vm.filters.bookingType
            );

            vm.filteredAllBids = vm.allBids.filter(bid =>
                vm.filters.bidStatus === 'all' || bid.status === vm.filters.bidStatus
            );

            vm.filteredPendingBids = vm.pendingBids.filter(bid =>
                vm.filters.pendingType === 'all' || bid.rentalType === vm.filters.pendingType
            );
        };

        /**
         * Function :: Accept Bid
         * @param {*} bid 
         * @description Creates a booking after accepting a bid.
         */
        vm.acceptBid = function (bid) {
            if (!bid || !bid.bidId || vm.isProcessing) {
                errorService.handleError('Invalid bid data or operation in progress');
                return;
            }

            vm.processingBidId = bid.bidId;
            vm.isProcessing = true;

            bidService.updateBidStatus(bid.bidId, 'accepted')
                .then(() => bookingService.createBooking(bid))
                .then(() => {
                    errorService.logSuccess('Bid accepted and booking created successfully');
                    return vm.getAllData(bid.car.owner.userId);
                })
                .catch(error => {
                    errorService.handleError('Failed to accept bid: ' + error.message);
                    if (vm.isProcessing) {
                        return bidService.updateBidStatus(bid.bidId, 'pending')
                            .catch(() => { /* Ignore revert errors */ });
                    }
                })
                .finally(() => {
                    vm.isProcessing = false;
                    vm.processingBidId = null;
                });
        };

        /**
         * Function :: Reject Bid
         * @param {*} bid 
         * @description Rejects a bid.
         */
        vm.rejectBid = function (bid) {
            bidService.updateBidStatus(bid.bidId, 'rejected')
                .then(() => {
                    console.log("Owner Dashboard :: Rejected bid");
                    vm.getAllData(bid.car.owner.userId);
                })
                .catch(err => errorService.handleError('Failed to reject bid: ' + err.message));
        };

        /**
         * Function :: Open Add KM Modal
         * @param {*} booking 
         * @description Opens a modal for adding additional charges.
         */
        vm.openAddKmModal = function (booking) {
            vm.bookingData = booking;
            var modalInstance = $uibModal.open({
                templateUrl: 'app/components/modals/addKmModal/addKmModal.template.html',
                controller: 'AddKmModalController',
                controllerAs: 'vm',
                backdrop: 'static',
                resolve: {
                    booking: function () {
                        return booking;
                    }
                }
            });
            modalInstance.result.then(function () {
                vm.getAllData();
            }, function () {
                console.log('Modal dismissed');
            });
        };
    }
]);