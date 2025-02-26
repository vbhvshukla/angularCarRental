mainApp.controller('UserBookingsController', ['$state', 'bookingService', 'authService',
    function ($state, bookingService, authService) {
        let vm = this;

        //Variable declarations
        vm.bookings = [];
        vm.isLoading = false;
        vm.errorMessage = '';
        vm.currentPage = 1;
        vm.filters = {};

        //Initialization function loads bookings.
        vm.init = function () {
            vm.loadBookings();
        };

        //Load all the bookings
        vm.loadBookings = function () {
            vm.isLoading = true;
            authService.getUser()
                .then(function (currentUser) {
                    if (!currentUser || !currentUser.userId) {
                        throw new Error('Bookings Controller :: User not authenticated');
                    }
                    return bookingService.getUserBookings(currentUser.userId, vm.currentPage, vm.filters);
                })
                .then(function (response) {
                    vm.bookings = response;
                })
                .catch(function (error) {
                    console.error('Error in loadBookings:', error);
                    vm.errorMessage = 'Bookings Controller :: Failed to load bookings: ' + error.message;
                    vm.isLoading = false;
                }).finally(() => {
                    vm.isLoading = false;
                })
        };

        //Cancel booking function
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