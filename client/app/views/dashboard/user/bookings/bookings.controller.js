mainApp.controller('UserBookingsController', ['$state', 'bookingService', 'authService',
    function ($state, bookingService, authService) {

        /**Variable Declarations */
        let vm = this;
        vm.bookings = [];
        vm.isLoading = false;
        vm.errorMessage = '';
        vm.currentPage = 1;
        vm.filters = {};

        /**
         * Function :: Initialization Function
         * @function vm.init()
         */

        vm.init = function () {
            vm.loadBookings();
        };

        /**
         * Function :: Load Bookings of User
         * @function vm.loadBookings()
         * @description Loads user's booking of the current loggedIn user.
         * @requires async,authService,bookingService
         */

        vm.loadBookings = function () {
            vm.isLoading = true;
            //Get the user and fetch all it's bookings from the userId.
            async.waterfall([
                function (callback) {
                    authService.getUser()
                        .then(user => callback(null, user))
                        .catch(err => callback(err));
                },
                function (user, callback) {
                    bookingService.getUserBookings(user._id, vm.currentPage, vm.filters)
                        .then(bookings => callback(null, { bookings }))
                        .catch(err => callback(err));
                }
            ], function (err, results) {
                if (err) {
                    console.error('Error in loadBookings:', error);
                    vm.errorMessage = 'Bookings Controller :: Failed to load bookings: ' + error.message;
                }
                else {
                    vm.bookings = results.bookings;
                }
                vm.isLoading = false;
            })
        };

        /**
         * Function :: Cancel a booking based on bookingId.
         * @param {*} bookingId 
         * @requires bookingService
         */

        vm.cancelBooking = function (bookingId) {
            if (confirm('Are you sure you want to cancel this booking?')) {
                bookingService.cancelBooking(bookingId)
                    .then(function () {
                        vm.loadBookings();
                    })
                    .catch(function (error) {
                        vm.errorMessage = 'Bookings Controller :: Failed to cancel booking: ' + error.message;
                    });
            }
        };

        //Redirect to bookings details page
        vm.viewBookingDetails = function (bookingId) {
            $state.go('dashboard.bookingDetails', { id: bookingId });
        };

        //Function to format date to Locale Date String
        vm.formatDate = function (date) {
            return new Date(date).toLocaleDateString();
        };

        //Pagination Function
        vm.changePage = function (newPage) {
            vm.currentPage = newPage;
            vm.loadBookings();
        };

    }]);