/**
 * Analytics Service
 * @requires $q, $http
 * @description Returns data of all the analytics for owner as well as admin.
 * Usage : analyticsService.getOwnerAnalytics()  , analyticsService.getAdminAnalytics.
 */

mainApp.service('analyticsService', [
    '$q', '$http',
    function ($q, $http) {
        /**
         * Function : Get Owner Analytics Data
         * @param {*} ownerId //For which owner.
         * @param {*} days //How many day's data should be fetched.
         * @returns {
         *              total:getTotals() //Count of bookings,bids,cars,
         *              charts {
         *                  revenue,bookings,cars,carUtilization,activeRenters,avgRevenueByType,
         *                  rentalDuration,revenueOverTime,avgRevenueByType,avgBidAmount
         *              }     
         *          }
        */
        const BASE_URL = 'http://127.0.0.1:8006/api/v1/ownerAnalytics';
        const BASE_ADMIN_URL = 'http://127.0.0.1:8006/api/v1/adminanalytics';
        this.getOwnerAnalytics = function (ownerId, days = 30) {
            const body = { ownerId, numberOfDays: days };
            console.log(body);
            return $q.all([
                $http.post(`${BASE_URL}/gettotalcount`, body),
                $http.post(`${BASE_URL}/bookingspercar`, body),
                $http.post(`${BASE_URL}/rentaldurationpercar`, body),
                $http.post(`${BASE_URL}/revenueovertime`, body),
                $http.post(`${BASE_URL}/bidamountovertime`, body),
                $http.post(`${BASE_URL}/revenuebycar`, body),
                $http.post(`${BASE_URL}/caravailabilityinsights`, body),
                $http.post(`${BASE_URL}/rentaltypedistribution`, body),
                $http.post(`${BASE_URL}/categoryperformance`, body),
                $http.post(`${BASE_URL}/peakbookinghours`, body)
            ]).then((
                [
                    totalsResponse,
                    bookingsResponse,
                    rentalDurationResponse,
                    revenueResponse,
                    bidAmountResponse,
                    revenueByCarResponse,
                    carAvailabilityResponse,
                    rentalTypeDistributionResponse,
                    categoryPerformanceResponse,
                    peakBookingHoursResponse
                ]) => {
                return {
                    totals: totalsResponse.data,
                    charts: {
                        bookings: bookingsResponse.data,
                        rentalDuration: rentalDurationResponse.data,
                        revenue: revenueResponse.data,
                        bidAmounts: bidAmountResponse.data,
                        revenueByCar: revenueByCarResponse.data,
                        carAvailability: carAvailabilityResponse.data,
                        rentalTypeDistribution: rentalTypeDistributionResponse.data,
                        categoryPerformance: categoryPerformanceResponse.data,
                        peakBookingHours: peakBookingHoursResponse.data
                    }
                };
            }).catch(err => {
                console.error("Error fetching owner analytics:", err);
                throw err;
            });
        };

        /**
         * Function : Get Admin Analytics Data
         * @param {*} days //How many day's data should be fetched.
         * @returns {
         *              getCardData:getCardData() //Gets the card data like totals of bookings,bids,cars,users
         *              charts {
         *                  totalRevenuePerCategory,totalRevenuePerCity,averageRevenuePerUser,bookingsOverTime,
         *                   carsPerCategory,highestRatedCarCategoryChart,bidsPerCategory,totalBiddedPricePerCategory,carsPerCity,
         *                   revenueTrends
         *              }     
         *          }
         */
        this.getAdminAnalytics = function (days = 30) {
            const body = { days };

            return $q.all([
                $http.post(`${BASE_ADMIN_URL}/totals`, body),
                $http.post(`${BASE_ADMIN_URL}/revenuebycity`, body),
                $http.post(`${BASE_ADMIN_URL}/revenuebyrentaltype`, body),
                $http.post(`${BASE_ADMIN_URL}/bookingtrends`, body),
                $http.post(`${BASE_ADMIN_URL}/topperformingowners`, body),
                $http.post(`${BASE_ADMIN_URL}/carspercategory`, body),
                $http.post(`${BASE_ADMIN_URL}/customerretentionanalysis`, body),
                $http.post(`${BASE_ADMIN_URL}/rentalduration`, body),
                $http.post(`${BASE_ADMIN_URL}/categoryperformance`, body),
                $http.post(`${BASE_ADMIN_URL}/bidsuccessrate`, body),
                $http.post(`${BASE_ADMIN_URL}/peakhours`, body)
            ]).then(([
                totalsResponse,
                revenueByCityResponse,
                revenueByRentalTypeResponse,
                bookingTrendsResponse,
                topOwnersResponse,
                carsByCategoryResponse,
                customerRetentionResponse,
                rentalDurationResponse,
                categoryPerformanceResponse,
                bidSuccessRateResponse,
                peakHoursResponse
            ]) => {
                return {
                    cards: totalsResponse.data,
                    charts: {
                        revenueByCity: revenueByCityResponse.data,
                        revenueByRentalType: revenueByRentalTypeResponse.data,
                        bookingTrends: bookingTrendsResponse.data,
                        topOwners: topOwnersResponse.data,
                        carsPerCategory: carsByCategoryResponse.data,
                        customerRetention: customerRetentionResponse.data,
                        rentalDuration: rentalDurationResponse.data,
                        categoryPerformance: categoryPerformanceResponse.data,
                        bidSuccessRate: bidSuccessRateResponse.data,
                        peakHours: peakHoursResponse.data
                    }
                };
            }).catch(err => {
                console.error("Error fetching admin analytics:", err);
                throw err;
            });
        };
    }
]);