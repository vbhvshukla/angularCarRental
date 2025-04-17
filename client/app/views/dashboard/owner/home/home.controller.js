/** @file Owner Dashboard's Home Controller */

mainApp.controller('OwnerHomeDashboardController', [
    '$http', 'bidService', 'userFactory', 'bookingFactory', 'bookingService', 'errorService', 'chatService', 'carService', '$uibModal', '$q',
    function ($http, bidService, userFactory, bookingFactory, bookingService, errorService, chatService, carService, $uibModal, $q) {

        /**
         * Variable declaration
         */
        let vm = this;
        vm.activeTab = 0; // Default to first tab (Pending Bids)

        // Sort configuration
        vm.sortConfig = {
            pendingBids: {
                field: 'bidAmount',
                reverse: false
            },
            bookings: {
                field: 'totalFare',
                reverse: false
            },
            allBids: {
                field: 'bidAmount',
                reverse: false
            }
        };

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
            pendingType: 'all',
            pendingCarId: '',
            allBidsCarId: '',
            bookingCarId: ''
        };
        vm.cars = [];
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
                {
                    bidStatus: vm.filters.bidStatus,
                    carId: vm.filters.allBidsCarId
                }
            );

            const pendingBidsPromise = bidService.getBidsForOwner(
                userId,
                vm.pagination.pendingBids.currentPage,
                vm.pagination.pendingBids.itemsPerPage,
                {
                    bidStatus: 'pending',
                    carId: vm.filters.pendingCarId
                }
            );

            const carsPromise = carService.getCarsByOwner(userId);

            // Use $q.all to execute all promises in parallel
            $q.all([bookingsPromise, bidsPromise, pendingBidsPromise, carsPromise])
                .then(([bookingsResult, bidsResult, pendingBidsResult, carsResult]) => {
                    // Handle bookings result
                    vm.bookings = bookingsResult.data.bookings || [];
                    vm.pagination.bookings.totalItems = bookingsResult.data.totalItems || 0;

                    // Handle all bids result
                    vm.allBids = bidsResult.bids || [];
                    vm.pagination.allBids.totalItems = bidsResult.totalItems || 0;

                    // Handle pending bids result
                    vm.pendingBids = pendingBidsResult.bids || [];
                    vm.pagination.pendingBids.totalItems = pendingBidsResult.totalItems || 0;

                    vm.cars = carsResult;

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
            // Filter bookings by type and car
            vm.filteredBookings = vm.bookings.filter(booking => {
                const typeMatch = vm.filters.bookingType === 'all' || booking.rentalType === vm.filters.bookingType;
                const carMatch = !vm.filters.bookingCarId || booking.bid.car.carId === vm.filters.bookingCarId;
                return typeMatch && carMatch;
            });

            // Filter all bids by status and car
            vm.filteredAllBids = vm.allBids.filter(bid => {
                const statusMatch = vm.filters.bidStatus === 'all' || bid.status === vm.filters.bidStatus;
                const carMatch = !vm.filters.allBidsCarId || bid.car.carId === vm.filters.allBidsCarId;
                return statusMatch && carMatch;
            });

            // Filter pending bids by type and car
            vm.filteredPendingBids = vm.pendingBids.filter(bid => {
                const typeMatch = vm.filters.pendingType === 'all' || bid.rentalType === vm.filters.pendingType;
                const carMatch = !vm.filters.pendingCarId || bid.car.carId === vm.filters.pendingCarId;
                return typeMatch && carMatch;
            });

            // // Trigger data refresh when filters change
            // if (userFactory.getCurrentUser()) {
            //     userFactory.getCurrentUser()
            //         .then(user => {
            //             vm.getAllData(user._id);
            //         })
            //         .catch(err => console.error("Owner controller :: Error Getting User :: ", err));
            // }
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
            const bookingInstance = bookingFactory.createBooking(bid);
            bookingInstance.create()
                .then(() => bidService.updateBidStatus(bid._id, 'accepted'))
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
         * Function :: Apply Sort
         * @param {string} type - The type of data to sort (pendingBids, bookings, allBids)
         * @param {string} field - The field to sort by
         */
        vm.applySort = function (type, field) {
            if (vm.sortConfig[type].field === field) {
                // Toggle sort direction if clicking the same field
                vm.sortConfig[type].reverse = !vm.sortConfig[type].reverse;
            } else {
                // Set new sort field and default to ascending
                vm.sortConfig[type].field = field;
                vm.sortConfig[type].reverse = false;
            }
            // Reset to first page when sorting changes
            vm.pagination[type].currentPage = 1;
        };

        /**
         * Function :: Get Sort Icon
         * @param {string} type - The type of data
         * @param {string} field - The field to check
         * @returns {string} - The appropriate sort icon
         */
        vm.getSortIcon = function (type, field) {
            if (vm.sortConfig[type].field !== field) return '';
            return vm.sortConfig[type].reverse ? '▼' : '▲';
        };

        /**
         * Function :: Get Sort Expression
         * @param {string} type - The type of data
         * @returns {string} - The sort expression for orderBy filter
         */
        vm.getSortExpression = function (type) {
            const config = vm.sortConfig[type];
            return config.reverse ? '-' + config.field : config.field;
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