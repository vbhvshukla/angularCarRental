mainApp.controller('OwnerHomeDashboardController', ['dbService', 'bidService', 'authService', 'bookingService',
    function (dbService, bidService, authService, bookingService) {

        //Variable Declaration
        let vm = this;

        // Pagination configuration
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

        vm.allBids = [];     //Holds all the bids for the owner
        vm.bookings = [];    //Holds all the bookings of owner's cars.
        vm.pendingBids = []; //Holds all the pending bids.

        // Filtered data
        vm.filteredBookings = [];
        vm.filteredAllBids = [];
        vm.filteredPendingBids = [];

        // Filter values
        vm.filters = {
            bookingType: 'all',
            bidStatus: 'all',
            pendingType: 'all'
        };

        //Initialization function
        vm.init = function () {
            authService.getUser()
                .then(user => vm.getAllData(user.userId))
                .catch(err => console.log("Owner controller :: Error Getting User :: ", err));
        }

        vm.getAllData = function (userId) {
            async.parallel([
                function (callback) {
                    dbService.getAllItemsByIndex('bookings', 'ownerId', userId)
                        .then((bookings) => callback(null, bookings))
                        .catch(err => callback(err));

                },
                function (callback) {
                    dbService.getAllItemsByIndex('bids', 'ownerId', userId)
                        .then((bids) => callback(null, bids))
                        .catch(err => callback(err));
                }
            ], function (err, results) {
                if (err) {
                    console.error("Owner dashboard :: Error Getting All Data :: ", err);
                }
                else {
                    vm.bookings = results[0];
                    vm.allBids = results[1];
                    vm.pendingBids = vm.allBids.filter(bid => bid.status.toLowerCase() === 'pending');
                    vm.applyFilters();
                }
            })
        }

        vm.applyFilters = function () {
            // Filter bookings
            vm.filteredBookings = vm.bookings.filter(booking =>
                vm.filters.bookingType === 'all' || booking.rentalType === vm.filters.bookingType
            );

            // Filter all bids
            vm.filteredAllBids = vm.allBids.filter(bid =>
                vm.filters.bidStatus === 'all' || bid.status === vm.filters.bidStatus
            );

            // Filter pending bids
            vm.filteredPendingBids = vm.pendingBids.filter(bid =>
                vm.filters.pendingType === 'all' || bid.rentalType === vm.filters.pendingType
            );

            // Update pagination
            vm.pagination.bookings.totalItems = vm.filteredBookings.length;
            vm.pagination.allBids.totalItems = vm.filteredAllBids.length;
            vm.pagination.pendingBids.totalItems = vm.filteredPendingBids.length;

            // Reset to first page
            vm.pagination.bookings.currentPage = 1;
            vm.pagination.allBids.currentPage = 1;
            vm.pagination.pendingBids.currentPage = 1;
        };

        vm.acceptBid = function (bid) {
            bookingService.createBooking(bid).then(() => {
                return bidService.updateStatus(bid.bidId, 'accepted');
            })
                .then(() => {
                    console.log("Onwer Dashboard :: Accepted bid");
                })
        }

        vm.rejectBid = function (bid) {

            bidService.updateStatus(bid.bidId, 'rejected')
                .then(() => {
                    console.log("Owner Dashboard :: Rejected bid");
                })
        }

        vm.getPaginatedData = function (data, paginationConfig) {
            const startIndex = (paginationConfig.currentPage - 1) * paginationConfig.itemsPerPage;
            return data.slice(startIndex, startIndex + paginationConfig.itemsPerPage);
        };

        // Navigation functions
        vm.previousPage = function (type) {
            if (vm.pagination[type].currentPage > 1) {
                vm.pagination[type].currentPage--;
            }
        };

        vm.nextPage = function (type) {
            const totalPages = Math.ceil(vm.pagination[type].totalItems / vm.pagination[type].itemsPerPage);
            if (vm.pagination[type].currentPage < totalPages) {
                vm.pagination[type].currentPage++;
            }
        };

        vm.getTotalAmount = function (booking) {
            return bookingService.calculateTotalAmount(booking);
        }
        vm.isBookingOver = function (booking) {
            if (new Date(booking.toTimestamp) > Date.now()) {
                return true;
            }
            else {
                return false;
            }
        }

        vm.shouldShowPagination = function (type) {
            return vm.pagination[type].totalItems > vm.pagination[type].itemsPerPage;
        };

        vm.getTotalPages = function (type) {
            return Math.ceil(vm.pagination[type].totalItems / vm.pagination[type].itemsPerPage);
        };
    }
])