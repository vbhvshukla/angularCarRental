/** @file Add Km Modal Controller */

mainApp.controller('AddKmModalController', [
    '$uibModalInstance',
    'bookingService',
    'errorService',
    'chatService',
    'booking',
    function ($uibModalInstance, bookingService, errorService, chatService, booking) {
        /**
         * Variable Declarations
         */

        var vm = this;
        vm.booking = booking;
        console.log(booking);
        vm.extras = { extraKm: 0, extraHr: 0, extraDay: 0 };

        /**
         * Add extras function
         * @function vm.addExtras()
         * @description To add charges based on additional kilometers driven , additional hours and additional days.
         * @requires bookingService
         */

        vm.addExtras = function () {
            console.log("1 -> Global Variables :: ", vm.booking, vm.extras.extraKm, vm.extras.extraHr, vm.extras.extraDay);
            bookingService.addExtras(vm.booking, vm.extras.extraKm, vm.extras.extraHr, vm.extras.extraDay)
                .then(function (updatedBooking) {
                    console.log("2 -> Updated Booking", updatedBooking);
                    return vm.generateAndSendInvoice(updatedBooking);
                })
                .then(function () {
                    console.log("3 -> Generate and Send Invoice");
                    $uibModalInstance.close();
                    errorService.logSuccess('Extras added and invoice sent successfully');
                })
                .catch(function (error) {
                    errorService.handleError('Failed to process extras: ' + error.message);
                });
        };

        /**
         * Generate and Send Invoice to chat Function
         * @function vm.generateAndSendInvoice()
         * @description To generate invoice and send it to the chat.
         * @param {*} booking 
         * @returns redirects to the bids page.
         */

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

        /**
         * Close Modal Function
         */
        
        vm.closeAddKmModal = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }
]);