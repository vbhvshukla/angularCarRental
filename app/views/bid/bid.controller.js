mainApp.controller('BiddingController', [
    '$scope', '$state', '$stateParams', 'carService', 'chatService',
    'authService', 'errorService', 'bidService',
    function ($scope, $state, $stateParams, carService, chatService,
        authService, errorService, bidService) {
        var vm = this;

        vm.car = null;
        vm.currentUser = null;
        vm.chatId = null;
        vm.showPriceInfoModal = false;
        vm.loading = true;

        function init() {
            vm.loading = true;

            Promise.all([
                authService.getUser(),
                carService.getCarById($stateParams.carId)
            ])
                .then(([user, car]) => {
                    if (!user) {
                        return $state.go('login', {
                            redirect: 'bid',
                            params: JSON.stringify({ carId: $stateParams.carId })
                        });
                    }
                    if (user.role !== 'customer') {
                        return $state.go('home');
                    }
                    if (!car) {
                        errorService.handleError('Car not found', 'BiddingController :: Init');
                        return $state.go('home');
                    }

                    vm.currentUser = user;
                    vm.car = car;
                    return createOrGetChat();
                })
                .then(() => {
                    if (!vm.car || !vm.currentUser || !vm.chatId) {
                        throw new Error('Missing required data');
                    }
                })
                .catch(error => {
                    errorService.handleError(error, 'BiddingController :: Init Failed');
                    return $state.go('home');
                })
                .finally(() => {
                    vm.loading = false;
                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                });
        }

        function createOrGetChat() {
            if (!vm.currentUser || !vm.car) return;

            return chatService.getOrCreateChat(vm.car.carId, vm.currentUser, vm.car.owner)
                .then(chat => {
                    vm.chatId = chat.chatId;
                    return chat;
                })
                .catch(error => {
                    errorService.handleError(error, 'BiddingController :: Chat Init Failed');
                });
        }

        vm.handleBidSubmit = function (bid) {
            if (vm.isSubmitting) return;

            vm.isSubmitting = true;

            if (!bid || !bid.bidAmount || !bid.startDate || !bid.endDate || !bid.rentalType) {
                errorService.handleError('Invalid bid data', 'BiddingController :: Bid Validation');
                return;
            }

            bidService.submitBid(vm.car.carId, bid, vm.currentUser)
                .then(() => {
                    errorService.logSuccess('Bid submitted successfully!', 'BiddingController :: Bid');
                    const message = `New bid placed: ${bid.rentalType} rental from ${new Date(bid.startDate).toLocaleDateString()} to ${new Date(bid.endDate).toLocaleDateString()}`;

                    return chatService.sendMessage(
                        vm.chatId,
                        vm.currentUser,
                        vm.car.owner,
                        message
                    );
                })
                .then(() => {
                    $state.go('userdashboard.bids');
                })
                .catch(error => {
                    errorService.handleError(error, 'BiddingController :: Bid Failed');
                })
                .finally(() => {
                    vm.isSubmitting = false;
                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                });
        };

        vm.showPriceInfo = function () {
            vm.showPriceInfoModal = true;
        };

        vm.closePriceInfo = function () {
            vm.showPriceInfoModal = false;
        };


        init();
    }
]);