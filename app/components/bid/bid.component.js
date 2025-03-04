mainApp.component('bidForm', {

    templateUrl: 'app/components/bid/bid.template.html',

    controller: ['bidService', 'errorService', 'authService',

        function (bidService, errorService, authService) {
            
            let $ctrl = this;

            /** Initialization function
             *@description Initializes the variables , Gets the current logged in user and sets it in @var $ctrl.currentUser
             *@requires authService
             *Available list of variables : 
             *@var $ctrl.rentalType {Holds the type of rental(local/outstation)}
             *@var $ctrl.isSubmitting {Loader boolean whilst bid submission}
             *@var $ctrl.showPriceBreakup {Boolean for modal}
             *@var $ctrl.estimate {Holds the bids estimated amount}
             *@var $ctrl.bid {Holds the bid object}
             */

            $ctrl.$onInit = function () {

                if (!$ctrl.carId || !$ctrl.car) {
                    errorService.handleError('Car data is required', 'BidForm :: Initialization');
                    return;
                }

                $ctrl.rentalType = 'local';
                $ctrl.isSubmitting = false;
                $ctrl.showPriceBreakup = false;
                $ctrl.estimate = null;

                $ctrl.bid = {
                    startDate: null,
                    endDate: null,
                    bidAmount: null,
                    rentalType: $ctrl.rentalType
                };

                authService.getUser()
                    .then(user => {
                        $ctrl.currentUser = user;
                    })
                    .catch(error => errorService.handleError(error, 'BidForm :: User Fetch Failed'));
            };

            /** Handle Date Change Function
             * @description Handles the calculations upon date changes.
             */

            $ctrl.onDateChange = function () {
                if ($ctrl.bid.startDate && $ctrl.bid.endDate) {
                    $ctrl.calculateEstimate();
                }
            };

            /** Set Rental Type function
             * @description Sets the rental type to the @var $ctrl.rentalType
             * @param {*} type 
             * @requires errorService
             */

            $ctrl.setRentalType = function (type) {
                if (type === 'local' && !$ctrl.car.isAvailableForLocal) {
                    errorService.handleError('Car not available for local rental', 'BidForm :: Validation');
                    return;
                }
                if (type === 'outstation' && !$ctrl.car.isAvailableForOutstation) {
                    errorService.handleError('Car not available for outstation rental', 'BidForm :: Validation');
                    return;
                }
                $ctrl.rentalType = type;
                $ctrl.bid.rentalType = type;
                $ctrl.bid.startDate = null;
                $ctrl.bid.endDate = null;
                $ctrl.estimate = null;
            };

            /** Estimate calcualtion function
             * @description Calculates the estimated amount.
             * Get the start,end date from @var $ctrl.bid format it in Date object
             * Check for availibility, calculate bid estimate.
             * @requires bidService
             */

            $ctrl.calculateEstimate = function () {
                if (!$ctrl.bid.startDate || !$ctrl.bid.endDate) return;

                $ctrl.isCalculating = true;

                const start = new Date($ctrl.bid.startDate);
                const end = new Date($ctrl.bid.endDate);

                if (end <= start) {
                    errorService.handleError('End date must be after start date', 'BidForm :: Validation');
                    return;
                }

                bidService.checkDateAvailability($ctrl.carId, start, end)
                    .then(isAvailable => {
                        if (!isAvailable) {
                            errorService.handleError('Selected dates are not available', 'BidForm :: Availability');
                            return;
                        }
                        return bidService.calculateEstimate($ctrl.carId, $ctrl.bid);
                    })
                    .then(estimate => {
                        if (estimate) {
                            $ctrl.estimate = estimate;
                            $ctrl.bid.bidAmount = estimate.minBid;
                        }
                    })
                    .catch(error => errorService.handleError(error, 'BidForm :: Estimate Failed'))
                    .finally(() => $ctrl.isCalculating = false);
            };

            /** Submit Bids function
             * @description Handles the Bid submission
             * @requires errorService,bidService
             */

            $ctrl.submitBid = function () {

                if ($ctrl.bidForm.$invalid || !$ctrl.estimate) {
                    errorService.handleError('BidForm :: Validation :: Please wait for price calculation');
                    return;
                }

                //The bid amount must be within the range of minBid and maxBid
                if ($ctrl.bid.bidAmount < $ctrl.estimate.minBid ||
                    $ctrl.bid.bidAmount > $ctrl.estimate.maxBid) {
                    errorService.handleError('BidForm :: Validation  :: Bid amount must be within allowed range');
                    return;
                }

                //Set loader true
                $ctrl.isSubmitting = true;

                bidService.submitBid($ctrl.carId, $ctrl.bid, $ctrl.currentUser)
                    .then(() => {
                        $ctrl.onBidSubmit({
                            bid: {
                                ...$ctrl.bid,
                                basePrice: $ctrl.estimate.basePrice
                            }
                        });
                        $ctrl.bid = {
                            startDate: null,
                            endDate: null,
                            bidAmount: null,
                            rentalType: 'local'
                        };
                        $ctrl.estimate = null;
                        $ctrl.showPriceBreakup = false;
                        if ($ctrl.bidForm) {
                            $ctrl.bidForm.$setPristine();
                            $ctrl.bidForm.$setUntouched();
                        }
                    })
                    .catch((error) => errorService.handleError(error, 'BidForm :: Submit Failed'))
                    .finally(() => { $ctrl.isSubmitting = false });
            };

            /** Price Modal Toggling function
             * @description Sets the price breakup modal true/false.
             */

            $ctrl.togglePriceBreakup = function () {
                $ctrl.showPriceBreakup = !$ctrl.showPriceBreakup;
            };
        }
    ],

    /** Bindings for the component.
     * @description Bindings : One way binding for carId,car.
     */
    
    bindings: {
        carId: '<',
        car: '<',
        onBidSubmit: '&'
    }
});