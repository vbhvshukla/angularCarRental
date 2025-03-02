mainApp.controller('OwnerHomeDashboardController', ['dbService', 'authService', 'bookingService',
    function (dbService, authService, bookingService) {

        //Variable Declaration
        let vm = this;

        vm.allBids = [];     //Holds all the bids for the owner
        vm.bookings = [];    //Holds all the bookings of owner's cars.
        vm.pendingBids = []; //Holds all the pending bids.

        //Initialization function
        vm.init = function () {
            authService.getUser()
            .then(user => vm.getAllData(user.userId))
            .catch(err => console.log("Owner controller :: Error Getting User :: ", err));
        }

        //Get all the bids , bookings of the owner
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
                }
            })
        }

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
    }
])