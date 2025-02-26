mainApp.component('bidForm', {
    templateUrl: 'app/components/bid/bid.template.html',
    controller: ['$scope', 'bidService', 'errorService', 'authService',
        function ($scope, bidService, errorService, authService) {
            let $ctrl = this;
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

                $scope.$watch('$ctrl.car', function (newVal) {
                    if (!newVal) {
                        errorService.handleError('Car data is required', 'BidForm :: Initialization');
                    }
                });
            };

            $scope.dateWatcher = $scope.$watchGroup(['$ctrl.bid.startDate', '$ctrl.bid.endDate'], function () {
                if ($ctrl.bid.startDate && $ctrl.bid.endDate) {
                    $ctrl.calculateEstimate();
                }
            });

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
                    .finally(() => {
                        $ctrl.isCalculating = false;
                    });
            };

            $ctrl.submitBid = function () {
                if ($ctrl.bidForm.$invalid) return;

                if (!$ctrl.estimate) {
                    errorService.handleError('Please wait for price calculation', 'BidForm :: Validation');
                    return;
                }

                if ($ctrl.bid.bidAmount < $ctrl.estimate.minBid ||
                    $ctrl.bid.bidAmount > $ctrl.estimate.maxBid) {
                    errorService.handleError('Bid amount must be within allowed range', 'BidForm :: Validation');
                    return;
                }

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
    /*However, scope isolation only goes so far, because AngularJS uses two-way binding. 
    So if you pass an object to a component like this - bindings: {item: '='}, and modify
    one of its properties, the change will be reflected in the parent component. 
    For components however, only the component that owns the data should modify it, 
    to make it easy to reason about what data is changed, and when. For that reason, 
    components should follow a few simple conventions:
    Inputs should be using < and @ bindings. The < symbol denotes one-way bindings which 
    are available since 1.5. The difference to = is that the bound properties in the component 
    scope are not watched, which means if you assign a new value to the property in the component
    scope, it will not update the parent scope. Note however, that both parent and component scope 
    reference the same object, so if you are changing object properties or array elements in the 
    component, the parent will still reflect that change. The general rule should therefore be to 
    never change an object or array property in the component scope. @ bindings can be used when 
    the input is a string, especially when the value of the binding doesn't change. */
    
     bindings: {
        carId: '<',
        car: '<',
        onBidSubmit: '&'
    }
});