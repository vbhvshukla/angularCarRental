mainApp.factory('bidFactory', ['$q', 'bidService', function ($q, bidService) {
    function Bid(initialData = {}) {
        this._id = initialData._id || null;
        this.carId = initialData.carId || null;
        this.user = initialData.user || {
            userId: null,
            username: null,
            email: null,
            role: null
        };
        this.bidAmount = initialData.bidAmount || null;
        this.status = initialData.status || 'pending';
        this.startDate = initialData.startDate || null;
        this.endDate = initialData.endDate || null;
        this.rentalType = initialData.rentalType || 'local';
    }

    function validateBidData(bid) {
        const errors = [];

        if (!bid.carId) errors.push('Car ID is required.');
        if (!bid.user || !bid.user._id) errors.push('User ID is required.');
        if (!bid.user.username || bid.user.username.length < 3) {
            errors.push('Username must be at least 3 characters long.');
        }
        if (!bid.user.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bid.user.email)) {
            errors.push('Invalid email format.');
        }
        if (!['customer', 'owner', 'admin'].includes(bid.user.role)) {
            errors.push('User role must be one of: customer, owner, admin.');
        }
        if (!bid.bidAmount || bid.bidAmount <= 0) errors.push('Bid amount must be greater than zero.');
        if (!bid.startDate) errors.push('Start date is required.');
        if (!bid.endDate) errors.push('End date is required.');
        if (new Date(bid.startDate) > new Date(bid.endDate)) {
            errors.push('End date must be after start date.');
        }
        if (!['local', 'outstation'].includes(bid.rentalType)) {
            errors.push('Rental type must be either "local" or "outstation".');
        }

        return errors;
    }

    Bid.prototype = {
        submit: function () {
            console.log(this);
            const deferred = $q.defer();
            const errors = validateBidData(this);

            if (errors.length > 0) {
                deferred.reject({ message: 'Validation failed', errors });
            } else {
                const bidData = {
                    startDate: this.startDate,
                    endDate: this.endDate,
                    status: this.status,
                    bidAmount: this.bidAmount,
                    rentalType: this.rentalType
                };

                const userData = {
                    userId: this.user._id,
                    username: this.user.username,
                    email: this.user.email,
                    role: this.user.role
                };

                bidService.submitBid(this.carId, bidData, userData)
                    .then(response => deferred.resolve(response))
                    .catch(error => deferred.reject(error));
            }

            return deferred.promise;
        },
        updateStatus: function (newStatus) {
            const deferred = $q.defer();

            if (!this._id) {
                deferred.reject({ message: 'Bid ID is required to update status.' });
            } else {
                bidService.updateBidStatus(this._id, newStatus)
                    .then(response => {
                        this.status = newStatus;
                        deferred.resolve(response);
                    })
                    .catch(error => deferred.reject(error));
            }

            return deferred.promise;
        },
        calculateEstimate: function () {
            const deferred = $q.defer();

            if (!this.carId || !this.startDate || !this.endDate) {
                deferred.reject({ message: 'Car ID, start date, and end date are required for estimate calculation.' });
            } else {
                bidService.calculateEstimate(this.carId, {
                    startDate: this.startDate,
                    endDate: this.endDate,
                    rentalType: this.rentalType
                })
                    .then(response => deferred.resolve(response))
                    .catch(error => deferred.reject(error));
            }

            return deferred.promise;
        }
    };

    return {
        createBid: function (data) {
            return new Bid(data);
        },
        getBidById: function (bidId) {
            return bidService.getBidById(bidId);
        },
        getBidsByUser: function (userId) {
            return bidService.getBidsByUser(userId);
        },
        getBidsByCar: function (carId) {
            return bidService.getBidsByCar(carId);
        },
        getBidsForOwner: function (ownerId, page, limit, filters) {
            return bidService.getBidsForOwner(ownerId, page, limit, filters);
        }
    };
}]);
