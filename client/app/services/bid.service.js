mainApp.service('bidService', ['$http', '$q', 'carService', 'errorService',
    function ($http, $q, carService, errorService) {

        /**
         * Estimate calculation for bid
         * @param {*} carId 
         * @param {*} bidData 
         * @returns resolved or rejected promise.
         */
        this.calculateEstimate = function (carId, bidData) {
            return $http.post('http://127.0.0.1:8006/api/v1/bid/calculateestimate', { carId, bidData })
                .then(response => response.data)
                .catch(error => errorService.handleError('BidService :: Estimate Failed', error));
        };

        /**
         * @function submitBid
         * @description saves the bid in the backend
         * @param {*} carId 
         * @param {*} bidData 
         * @param {*} userData 
         * @returns resolved or rejected promise.
         */
        this.submitBid = function (carId, bidData, userData) {
            return $http.post('http://127.0.0.1:8006/api/v1/bid/submit', { carId, bidData, userData })
                .then(response => response.data)
                .catch(error => errorService.handleError('BidService :: Submit Failed', error));
        };

        /**
         * @function checkDateAvailability()
         * @param {*} carId 
         * @param {*} startDate 
         * @param {*} endDate 
         * @returns boolean.
         */
        this.checkDateAvailability = function (carId, startDate, endDate) {
            return $http.get(`http://127.0.0.1:8006/api/v1/bid/checkavailability?carId=${carId}&startDate=${startDate}&endDate=${endDate}`)
                .then(response => response.data.isAvailable)
                .catch(error => errorService.handleError('BidService :: Availability Check Failed', error));
        };

        /**
         * @function getBidsByUser()
         * @param {*} userId 
         * @returns all bids of a user
         */
        this.getBidsByUser = function (userId) {
            return $http.get(`http://127.0.0.1:8006/api/v1/bid/userbids/${userId}`)
                .then(response => response.data)
                .catch(error => errorService.handleError('BidService :: User Bids Fetch Failed', error));
        };

        /**
         * @function getBidsByCar
         * @description Get Bids By CarId
         * @param {*} carId 
         * @returns 
         */
        this.getBidsByCar = function (carId) {
            return $http.get(`http://127.0.0.1:8006/api/v1/bid/carbids/${carId}`)
                .then(response => response.data)
                .catch(error => errorService.handleError('BidService :: Car Bids Fetch Failed', error));
        };

        /**
         * @function updateBidStatus()
         * @description Update the bid's status
         * @param {*} bidId 
         * @param {*} status 
         * @returns 
         */
        this.updateBidStatus = function (bidId, status) {
            return $http.put(`http://127.0.0.1:8006/api/v1/bid/updatestatus/${bidId}`, { status })
                .then(response => response.data)
                .catch(error => errorService.handleError('BidService :: Status Update Failed', error));
        };

        /**
         * @function getBidById()
         * @description Get Bid By its Id
         * @param {*} bidId 
         * @returns 
         */
        this.getBidById = function (bidId) {
            if (!bidId) {
                return $q.reject(new Error('Bid ID is required'));
            }
            return $http.get(`http://127.0.0.1:8006/api/v1/bid/getbid/${bidId}`)
                .then(response => response.data)
                .catch(error => errorService.handleError('BidService :: Get Bid Failed', error));
        };

        /**
         * @function getBidsForOwner
         * @description Get Bids For Owner
         * @param {*} ownerId 
         * @param {*} page 
         * @param {*} limit 
         * @param {*} filters 
         * @returns 
         */
        this.getBidsForOwner = function (ownerId, page, limit, filters) {
            const params = {
                page,
                limit,
                bidStatus: filters.bidStatus || 'all'
            };
            return $http.get(`/api/v1/bid/ownerbids/${ownerId}`, { params })
                .then(response => response.data);
        };
    }
]);

