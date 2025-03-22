mainApp.service('bidService', ['$http', '$q', 'carService', 'errorService',
    function ($http, $q, carService, errorService) {

        /**
         * Estimate calculation for bid
         * @param {*} carId 
         * @param {*} bidData 
         * @returns resolved or rejected promise.
         */
        this.calculateEstimate = function (carId, bidData) {
            const deferred = $q.defer();
            $http.post('http://127.0.0.1:8006/api/v1/bid/calculateestimate', { carId, bidData })
                .then(response => deferred.resolve(response.data))
                .catch(error => {
                    errorService.handleError('BidService :: Estimate Failed', error);
                    deferred.reject(error);
                });
            return deferred.promise;
        };

        /**
         * Submit a bid
         * @param {*} carId 
         * @param {*} bidData 
         * @param {*} userData 
         * @returns resolved or rejected promise.
         */
        this.submitBid = function (carId, bidData, userData) {
            const deferred = $q.defer();
            $http.post('http://127.0.0.1:8006/api/v1/bid/submit', { carId, bidData, userData })
                .then(response => deferred.resolve(response.data))
                .catch(error => {
                    errorService.handleError('BidService :: Submit Failed', error);
                    deferred.reject(error);
                });
            return deferred.promise;
        };

        /**
         * Check date availability
         * @param {*} carId 
         * @param {*} startDate 
         * @param {*} endDate 
         * @returns resolved or rejected promise.
         */
        this.checkDateAvailability = function (carId, startDate, endDate) {
            const deferred = $q.defer();
            $http.get(`http://127.0.0.1:8006/api/v1/bid/checkavailability?carId=${carId}&startDate=${startDate}&endDate=${endDate}`)
                .then(response => deferred.resolve(response.data.isAvailable))
                .catch(error => {
                    errorService.handleError('BidService :: Availability Check Failed', error);
                    deferred.reject(error);
                });
            return deferred.promise;
        };

        /**
         * Get bids by user
         * @param {*} userId 
         * @returns resolved or rejected promise.
         */
        this.getBidsByUser = function (userId) {
            const deferred = $q.defer();
            $http.get(`http://127.0.0.1:8006/api/v1/bid/userbids/${userId}`)
                .then(response => deferred.resolve(response.data))
                .catch(error => {
                    errorService.handleError('BidService :: User Bids Fetch Failed', error);
                    deferred.reject(error);
                });
            return deferred.promise;
        };

        /**
         * Get bids by car
         * @param {*} carId 
         * @returns resolved or rejected promise.
         */
        this.getBidsByCar = function (carId) {
            const deferred = $q.defer();
            $http.get(`http://127.0.0.1:8006/api/v1/bid/carbids/${carId}`)
                .then(response => deferred.resolve(response.data))
                .catch(error => {
                    errorService.handleError('BidService :: Car Bids Fetch Failed', error);
                    deferred.reject(error);
                });
            return deferred.promise;
        };

        /**
         * Update bid status
         * @param {*} bidId 
         * @param {*} status 
         * @returns resolved or rejected promise.
         */
        this.updateBidStatus = function (bidId, status) {
            const deferred = $q.defer();
            $http.put(`http://127.0.0.1:8006/api/v1/bid/updatestatus/${bidId}`, { status })
                .then(response => deferred.resolve(response.data))
                .catch(error => {
                    errorService.handleError('BidService :: Status Update Failed', error);
                    deferred.reject(error);
                });
            return deferred.promise;
        };

        /**
         * Get bid by ID
         * @param {*} bidId 
         * @returns resolved or rejected promise.
         */
        this.getBidById = function (bidId) {
            const deferred = $q.defer();
            if (!bidId) {
                deferred.reject(new Error('Bid ID is required'));
            } else {
                $http.get(`http://127.0.0.1:8006/api/v1/bid/getbid/${bidId}`)
                    .then(response => deferred.resolve(response.data))
                    .catch(error => {
                        errorService.handleError('BidService :: Get Bid Failed', error);
                        deferred.reject(error);
                    });
            }
            return deferred.promise;
        };

        /**
         * Get bids for owner
         * @param {*} ownerId 
         * @param {*} page 
         * @param {*} limit 
         * @param {*} filters 
         * @returns resolved or rejected promise.
         */
        this.getBidsForOwner = function (ownerId, page, limit, filters) {
            const deferred = $q.defer();
            const params = {
                page,
                limit,
                bidStatus: filters.bidStatus || 'all'
            };
            $http.get(`http://127.0.0.1:8006/api/v1/bid/ownerbids/${ownerId}`, { params })
                .then(response => deferred.resolve(response.data))
                .catch(error => {
                    errorService.handleError('BidService :: Owner Bids Fetch Failed', error);
                    deferred.reject(error);
                });
            return deferred.promise;
        };
    }
]);

