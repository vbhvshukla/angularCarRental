mainApp.controller('UserBidsController', ['bidService', 'authService',
    function (bidService, authService) {

        //Var Declarations
        let vm = this;
        vm.bids = {};
        vm.filteredBids = {};
        vm.filters = {
            rentalType: '',
            status: ''
        };

        //Initialization
        vm.init = function () {
            loadUserBids();
        };

        //Load the user -> Get it's bid by it's user id and set the variables accordingly.
        function loadUserBids() {
            async.waterfall([
                function(callback){
                    authService.getUser()
                    .then(user=>callback(null,user))
                    .catch(err=>callback(err));
                },
                function(user,callback){
                    bidService.getBidsByUser(user.userId)
                    .then(bids=>callback(null,{bids}))
                    .catch(err=>callback(err));
                }

            ],function(err,results){
                if(err){
                    console.error('User Dashboard :: All Bids Controller :: Error Getting Bids :: ', err);
                }
                else{
                    vm.bids = results.bids;
                    vm.filterBids();
                }
            })
        }

        //Filter bids (Types : Rental/Status)
        vm.filterBids = function () {
            vm.filteredBids = vm.bids.filter(function (bid) {
                let matchRentalType = true;
                let matchStatus = true;
                if (vm.filters.rentalType) {
                    matchRentalType = bid.rentalType === vm.filters.rentalType;
                }
                if (vm.filters.status) {
                    matchStatus = bid.status === vm.filters.status;
                }
                return matchRentalType && matchStatus;
            });
        };

        //Cancel Bids (Parameters required -> Bid Object)
        vm.cancelBid = function (bid) {
            if (bid.status === 'pending') {
                bid.status = 'cancelled';
                bidService.updateBidStatus(bid.bidId, 'cancelled')
                    .then(function () {
                        vm.filterBids();
                    })
                    .catch(function (error) {
                        console.error('User Dashboard :: All Bids Controller :: Error Cancelling Bids', error);
                        bid.status = 'pending';
                    });
            }
        };
        //Format Date function toLocalDateString (Parameters required -> Date)
        vm.formatDate = function (date) {
            return new Date(date).toLocaleDateString();
        };
    }
]);