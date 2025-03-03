mainApp.component('bidForm', {
    templateUrl: 'app/components/bid/bid.template.html',
    controller: ['$scope', 'bidService', 'errorService', 'authService',
        function ($scope, bidService, errorService, authService) {
            let $ctrl = this;

            //Initialization functionf for the bid component.
            //Get the currently logged in user and set the currentUser to $ctrl.

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

            //Removed $watch here,
            //If there's a date change calculate the estimated price accordingly.

            $ctrl.onDateChange = function() {
                if ($ctrl.bid.startDate && $ctrl.bid.endDate) {
                    $ctrl.calculateEstimate();
                }
            };

            //Setting the rental type
            $ctrl.setRentalType = function (type) {
                if (type === 'local' && !$ctrl.car.isAvailableForLocal) {
                    errorService.handleError('Car not available for local rental', 'BidForm :: Validation');
                    return;
                }
                if (type === 'outstation' && !$ctrl.car.isAvailableForOutstation) {
                    errorService.handleError('Car not available for outstation rental', 'BidForm :: Validation');
                    return;
                }
                //Reset the already set data when rental type is changed.
                $ctrl.rentalType = type;
                $ctrl.bid.rentalType = type;
                $ctrl.bid.startDate = null;
                $ctrl.bid.endDate = null;
                $ctrl.estimate = null;
            };

            //Calculation

            $ctrl.calculateEstimate = function () {
                if (!$ctrl.bid.startDate || !$ctrl.bid.endDate) return;

                //Set loader true
                $ctrl.isCalculating = true;

                //Get the start and end date and format it according to the date object.
                const start = new Date($ctrl.bid.startDate);
                const end = new Date($ctrl.bid.endDate);

                //Throw error if the end date is before the start date.
                if (end <= start) {
                    errorService.handleError('End date must be after start date', 'BidForm :: Validation');
                    return;
                }

                //Check is the car is available or not.
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
                    .finally(() => {
                        $ctrl.isCalculating = false;
                    });
            };

            //Submit Bid function.
            $ctrl.submitBid = function () {
                //Return if the form is not valid(all frontend validations)
                if ($ctrl.bidForm.$invalid) return;

                //Return if there's no estimate.
                if (!$ctrl.estimate) {
                    errorService.handleError('Please wait for price calculation', 'BidForm :: Validation');
                    return;
                }

                //The bid amount must be within the range of minBid and maxBid
                if ($ctrl.bid.bidAmount < $ctrl.estimate.minBid ||
                    $ctrl.bid.bidAmount > $ctrl.estimate.maxBid) {
                    errorService.handleError('Bid amount must be within allowed range', 'BidForm :: Validation');
                    return;
                }

                //Before submitting set this to true
                $ctrl.isSubmitting = true;
                
                //Submit the bid
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
                    .catch(error => errorService.handleError(error, 'BidForm :: Submit Failed'))
                    .finally(() => {
                        $ctrl.isSubmitting = false;
                    });
            };

            $ctrl.togglePriceBreakup = function () {
                $ctrl.showPriceBreakup = !$ctrl.showPriceBreakup;
            };

            $ctrl.$onDestroy = function () {
                if ($scope.dateWatcher) {
                    $scope.dateWatcher();
                }
            };
        }
    ],
    bindings: {
        carId: '<',
        car: '<',
        onBidSubmit: '&'
    }
});