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
            bookingService.addExtras(vm.booking._id, vm.extras)
                .then(function (updatedBooking) {
                    errorService.logSuccess('Extras added and invoice sent successfully');
                    $uibModalInstance.close();
                    return bookingService.generateInvoice(updatedBooking.data.booking._id);

                })
                .catch(function (error) {
                    $uibModalInstance.close();
                    errorService.handleError('Failed to process extras: ' + error.message);
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