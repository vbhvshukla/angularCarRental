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
        this.getOwnerAnalytics = function (ownerId, days = 30) {
            const body = { ownerId, numberOfDays: days };

            return $q.all([
                $http.post('http://127.0.0.1:8006/api/v1/ownerAnalytics/gettotalcount', body),
                $http.post('http://127.0.0.1:8006/api/v1/ownerAnalytics/bookingspercar', body),
                $http.post('http://127.0.0.1:8006/api/v1/ownerAnalytics/rentaldurationpercar', body),
                $http.post('http://127.0.0.1:8006/api/v1/ownerAnalytics/revenueovertime', body),
                $http.post('http://127.0.0.1:8006/api/v1/ownerAnalytics/bidamountovertime', body)
            ]).then(([totalsResponse, bookingsResponse, rentalDurationResponse, revenueResponse, bidAmountResponse]) => {
                return {
                    totals: totalsResponse.data,
                    charts: {
                        bookings: bookingsResponse.data,
                        rentalDuration: rentalDurationResponse.data,
                        revenue: revenueResponse.data,
                        bidAmounts: bidAmountResponse.data
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
                $http.post('http://127.0.0.1:8006/api/v1/adminAnalytics/totals', body),
                $http.post('http://127.0.0.1:8006/api/v1/adminAnalytics/revenuebycity', body),
                $http.post('http://127.0.0.1:8006/api/v1/adminAnalytics/revenuebyrentaltype', body),
                $http.post('http://127.0.0.1:8006/api/v1/adminAnalytics/bookingtrends', body),
                $http.post('http://127.0.0.1:8006/api/v1/adminAnalytics/topperformingowners', body),
                $http.post('http://127.0.0.1:8006/api/v1/adminAnalytics/carspercategory', body)
            ]).then(([totalsResponse, revenueByCityResponse, revenueByRentalTypeResponse, bookingTrendsResponse, topOwnersResponse, carsPerCategoryResponse]) => {
                return {
                    cards: totalsResponse.data,
                    charts: {
                        revenueByCity: revenueByCityResponse.data,
                        revenueByRentalType: revenueByRentalTypeResponse.data,
                        bookingTrends: bookingTrendsResponse.data,
                        topOwners: topOwnersResponse.data,
                        carsPerCategory: carsPerCategoryResponse.data
                    }
                };
            }).catch(err => {
                console.error("Error fetching admin analytics:", err);
                throw err;
            });
        };
    }
]);