/** @file Owner Dashboard's Home Controller */

mainApp.controller('OwnerHomeDashboardController', [
    '$http', 'bidService', 'userFactory','bookingFactory', 'bookingService', 'errorService', 'chatService', '$uibModal', '$q',
    function ($http, bidService, userFactory,bookingFactory, bookingService, errorService, chatService, $uibModal, $q) {

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
         * @requires userFactory
         */
        vm.init = function () {
            userFactory.getCurrentUser() // Use userFactory to fetch the current user
                .then(user => { console.log(user); vm.getAllData(user._id) })
                .catch(err => console.error("Owner controller :: Error Getting User :: ", err));
        };

        /**
         * Function :: Get All Data
         * @param {*} userId 
         * @description Fetches all bookings and bids for the current logged-in user.
         * @requires bookingService, bidService
         */
        vm.getAllData = function (userId) {
            // Create promises for fetching bookings and bids
            const bookingsPromise = bookingService.getBookingsForOwner(
                userId,
                vm.pagination.bookings.currentPage,
                vm.pagination.bookings.itemsPerPage,
                vm.filters
            );

            const bidsPromise = bidService.getBidsForOwner(
                userId,
                vm.pagination.allBids.currentPage,
                vm.pagination.allBids.itemsPerPage,
                vm.filters
            );

            // Use $q.all to execute both promises in parallel
            $q.all([bookingsPromise, bidsPromise])
                .then(([bookingsResult, bidsResult]) => {
                    // Handle bookings result
                    vm.bookings = bookingsResult.data.bookings || [];
                    vm.pagination.bookings.totalItems = bookingsResult.data.totalItems || 0;
                    // console.log(bidsResult)
                    // Handle bids result
                    vm.allBids = bidsResult.bids || [];
                    // console.log(vm.allBids)
                    vm.pagination.allBids.totalItems = bidsResult.totalItems || 0;

                    // Filter pending bids
                    vm.pendingBids = vm.allBids.filter(bid => bid.status.toLowerCase() === "pending");

                    console.log(vm.pendingBids)
                    // Apply filters after fetching data
                    vm.applyFilters();
                })
                .catch(err => {
                    console.error("Owner dashboard :: Error Getting All Data :: ", err);
                    vm.errorMessage = "Failed to fetch data. Please try again.";
                    errorService.handleError(vm.errorMessage);
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
            if (!bid || !bid._id || vm.isProcessing) {
                errorService.handleError('Invalid bid data or operation in progress');
                return;
            }

            vm.processingBidId = bid._id;
            vm.isProcessing = true;

            bidService.updateBidStatus(bid._id, 'accepted')
                .then(() => bookingFactory.createBooking(bid))
                .then(() => {
                    errorService.logSuccess('Bid accepted and booking created successfully');
                    return vm.getAllData(bid.car.owner.userId);
                })
                .catch(error => {
                    errorService.handleError('Failed to accept bid: ' + error.message);
                    if (vm.isProcessing) {
                        return bidService.updateBidStatus(bid._id, 'pending')
                            .catch(() => { /* something soethngn */ });
                    }
                })
                .finally(() => {
                    vm.isProcessing = false;
                    vm.processingBidId = null;
                });
            vm.applyFilters();
        };

        /**
         * Function :: Reject Bid
         * @param {*} bid 
         * @description Rejects a bid.
         */
        vm.rejectBid = function (bid) {
            bidService.updateBidStatus(bid._id, 'rejected')
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
                vm.applyFilters();
            }, function () {
                console.log('Modal dismissed');
            });
        };

        /**
         * Function :: Get Paginated Data
         * @param {*} data 
         * @param {*} pagination 
         * @description Returns paginated data based on the current page and items per page.
         */
        vm.getPaginatedData = function (data, pagination) {
            const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
            const endIndex = startIndex + pagination.itemsPerPage;
            return data.slice(startIndex, endIndex);
        };

        /**
         * Function :: Is Booking Over
         * @param {*} booking 
         * @description Checks if the booking has ended based on the current date and time.
         * @returns {boolean} True if the booking is over, false otherwise.
         */
        vm.isBookingOver = function (booking) {
            if (!booking || !booking.toTimestamp) {
                return false; // Return false if booking or toTimestamp is invalid
            }
            const currentTime = new Date(); // Get the current date and time
            const bookingEndTime = new Date(booking.toTimestamp); // Convert toTimestamp to a Date object
            return currentTime > bookingEndTime; // Return true if the current time is past the booking end time
        };
    }
]);