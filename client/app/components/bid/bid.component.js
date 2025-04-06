mainApp.component('bidForm', {

    templateUrl: 'app/components/bid/bid.template.html',

    controller: ['bidService', 'errorService', 'userFactory',

        function (bidService, errorService, userFactory) {

            let $ctrl = this;
            $ctrl.isStartOpen = false;
            $ctrl.isEndOpen = false;

            var today = new Date();
            $ctrl.minDate = today.toISOString().split('T')[0];

            /** Initialization function
             *@description Initializes the variables , Gets the current logged in user and sets it in @var $ctrl.currentUser
             *@requires userFactory
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

                userFactory.getCurrentUser()
                    .then(user => {
                        $ctrl.currentUser = user;
                    })
                    .catch(error => errorService.handleError(error, 'BidForm :: User Fetch Failed'));
            };

            $ctrl.openCalendar = function (e) {
                e.preventDefault();
                e.stopPropagation();
                $ctrl.isStartOpen = true;
            };

            $ctrl.openEndCalendar = function (e) {
                e.preventDefault();
                e.stopPropagation();
                $ctrl.isEndOpen = true;
            }


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
                const today = new Date();
                today.setHours(0, 0, 0, 0);


                if (start < today) {
                    alert('Start date must be today or later');
                    errorService.handleError('Start Date Must Be Today or Later');
                    $ctrl.resetBidFields();
                    $ctrl.isCalculating = false;
                    return;
                }

                if (end < start) {
                    alert("End date must be after start date', 'BidForm :: Validation")
                    errorService.handleError('End date must be after start date', 'BidForm :: Validation');
                    $ctrl.isCalculating = false;
                    $ctrl.resetBidFields();

                    return;
                }

                bidService.checkDateAvailability($ctrl.carId, start, end)
                    .then(isAvailable => {
                        console.log(isAvailable)
                        if (!isAvailable) {
                            $ctrl.resetBidFields();
                            errorService.handleError('Selected dates are not available', 'BidForm :: Availability');
                            $ctrl.isCalculating = false;
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
                    .catch(error => { $ctrl.resetBidFields(); $ctrl.isCalculating = false; errorService.handleError(error, 'BidForm :: Estimate Failed') })
                    .finally(() => $ctrl.isCalculating = false);
            };

            /** Submit Bids function
             * @description Handles the Bid submission
             * @requires errorService,bidService
             */

            $ctrl.submitBid = function () {
                if ($ctrl.isSubmitting) return;
                if ($ctrl.bidForm.$invalid || !$ctrl.estimate) {
                    errorService.handleError('BidForm :: Validation :: Please wait for price calculation');
                    $ctrl.resetBidFields();
                    return;
                }

                if ($ctrl.bid.bidAmount < $ctrl.estimate.minBid ||
                    $ctrl.bid.bidAmount > $ctrl.estimate.maxBid) {
                    errorService.handleError('BidForm :: Validation  :: Bid amount must be within allowed range');
                    $ctrl.resetBidFields();
                    return;
                }

                $ctrl.isSubmitting = true;
                const bidData = {
                    ...$ctrl.bid,
                    basePrice: $ctrl.estimate.basePrice
                };
                // send bid data through onBidSubmit
                $ctrl.onBidSubmit({ bid: bidData });
            };

            $ctrl.resetBidFields = function () {
                $ctrl.bid = {
                    startDate: null,
                    endDate: null,
                    bidAmount: null,
                    rentalType: $ctrl.rentalType
                };

                $ctrl.estimate = null;
                $ctrl.isCalculating = false;

                if ($ctrl.bidForm) {
                    $ctrl.bidForm.$setPristine(); // Mark the form as pristine
                    $ctrl.bidForm.$setUntouched(); // Mark the form as untouched
                }
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
        onBidSubmit: '&',
        isSubmitting: '='
    }
});