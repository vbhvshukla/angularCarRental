mainApp.controller('OwnerHomeDashboardController', ['dbService', 'bidService', 'authService', 'bookingService', 'errorService', 'chatService',
    function (dbService, bidService, authService, bookingService, errorService, chatService) {

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

        vm.extras = {
            extraKm: 0,
            extraHr: 0,
            extraDay: 0,
        }
        vm.bookingData = null;
        vm.allBids = [];     //Holds all the bids for the owner
        vm.bookings = [];    //Holds all the bookings of owner's cars.
        vm.pendingBids = []; //Holds all the pending bids.
        vm.showAddKmModal = false;
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
            vm.filteredBookings = vm.bookings.filter(booking =>
                vm.filters.bookingType === 'all' || booking.rentalType === vm.filters.bookingType
            );

            vm.filteredAllBids = vm.allBids.filter(bid =>
                vm.filters.bidStatus === 'all' || bid.status === vm.filters.bidStatus
            );

            vm.filteredPendingBids = vm.pendingBids.filter(bid =>
                vm.filters.pendingType === 'all' || bid.rentalType === vm.filters.pendingType
            );

            vm.pagination.bookings.totalItems = vm.filteredBookings.length;
            vm.pagination.allBids.totalItems = vm.filteredAllBids.length;
            vm.pagination.pendingBids.totalItems = vm.filteredPendingBids.length;

            vm.pagination.bookings.currentPage = 1;
            vm.pagination.allBids.currentPage = 1;
            vm.pagination.pendingBids.currentPage = 1;
        };

        vm.acceptBid = function (bid) {
            if (!bid || !bid.bidId) {
                errorService.handleError('Invalid bid data');
                return;
            }
            vm.isProcessing = true;

            bidService.updateBidStatus(bid.bidId, 'accepted')
                .then(function () {
                    return bookingService.createBooking(bid);
                })
                .then(function () {
                    errorService.logSuccess('Bid accepted and booking created successfully');
                    return vm.getAllData(bid.car.owner.userId);
                })
                .catch(function (error) {
                    errorService.handleError('Failed to accept bid: ' + error.message);
                })
                .finally(function () {
                    vm.isProcessing = false;
                });
        }

        vm.rejectBid = function (bid) {
            bidService.updateBidStatus(bid.bidId, 'rejected')
                .then(() => {
                    console.log("Owner Dashboard :: Rejected bid");
                })
        }

        vm.getPaginatedData = function (data, paginationConfig) {
            const startIndex = (paginationConfig.currentPage - 1) * paginationConfig.itemsPerPage;
            return data.slice(startIndex, startIndex + paginationConfig.itemsPerPage);
        };

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
            return new Date(booking.toTimestamp) < Date.now();
        };

        vm.shouldShowPagination = function (type) {
            return vm.pagination[type].totalItems > vm.pagination[type].itemsPerPage;
        };

        vm.getTotalPages = function (type) {
            return Math.ceil(vm.pagination[type].totalItems / vm.pagination[type].itemsPerPage);
        };

        vm.closeAddKmModal = function () {
            vm.showAddKmModal = false;
        }

        vm.openAddKmModal = function (booking) {
            vm.showAddKmModal = true;
            vm.bookingData = booking;
        }

        // vm.addExtras = function () {
        //     bookingService.addExtras(vm.bookingData, this.extras.extraKm, this.extras.extraHr, this.extras.extraDay)
        // }
        vm.addExtras = function () {
            console.log("1 -> Global Variables :: ", vm.bookingData, vm.extras.extraKm, vm.extras.extraHr, vm.extras.extraDay);
            bookingService.addExtras(vm.bookingData, vm.extras.extraKm, vm.extras.extraHr, vm.extras.extraDay)
                .then(function (updatedBooking) {
                    console.log("2 -> Updated Booking", updatedBooking)
                    return vm.generateAndSendInvoice(updatedBooking);
                })
                .then(function () {
                    console.log("3 -> Generate and Send Invoice")
                    vm.showAddKmModal = false;
                    vm.extras = { extraKm: 0, extraHr: 0, extraDay: 0 };
                    errorService.logSuccess('Extras added and invoice sent successfully');
                })
                .catch(function (error) {
                    errorService.handleError('Failed to process extras: ' + error.message);
                });
        };

        vm.generateAndSendInvoice = function (booking) {
            console.log("4 -> Booking in Generate and Send Invoice", booking);
            const doc = new jspdf.jsPDF();

            doc.setFontSize(20);
            doc.text('INVOICE', 105, 20, { align: 'center' });

            doc.setFontSize(12);
            doc.text(`Booking ID: ${booking.bookingId}`, 20, 40);
            doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 50);
            doc.text(`Car: ${booking.bid.car.carName}`, 20, 60);
            doc.text(`Rental Type: ${booking.rentalType}`, 20, 70);
            doc.text(`Duration: ${new Date(booking.fromTimestamp).toLocaleDateString()} to ${new Date(booking.toTimestamp).toLocaleDateString()}`, 20, 80);

            doc.text('Charges Breakdown:', 20, 100);
            doc.text(`Base Fare: ₹${booking.baseFare}`, 30, 110);
            doc.text(`Extra KM Charges: ₹${booking.extraKmCharges}`, 30, 120);
            doc.text(`Extra Hour Charges: ₹${booking.extraHourCharges}`, 30, 130);
            doc.text(`Total Amount: ₹${booking.totalFare}`, 20, 150);

            const pdfBlob = doc.output('blob');
            const pdfFile = new File([pdfBlob], `invoice_${booking.bookingId}.pdf`, {
                type: 'application/pdf'
            });
        

            return chatService.getOrCreateChat(
                booking.bid.car.carId,
                booking.bid.user,
                booking.bid.car.owner
            )
                .then(function (conversation) {
                    const message = `Additional charges have been added to your booking (ID: ${booking.bookingId}).`;
                    return chatService.sendOwnerMessage(
                        conversation.chatId,
                        booking.bid.car.owner,
                        booking.bid.user,
                        message,
                        pdfFile
                    );
                });
        };
    }
])