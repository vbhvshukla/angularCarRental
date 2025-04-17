/**
 * Predictive Analytics Service
 * @requires $q, $http
 * @description Returns predictive analytics data for owner as well as admin.
 * Usage : predictiveAnalyticsService.getAdminPredictions(), predictiveAnalyticsService.getOwnerPredictions()
 */

mainApp.service('predictiveAnalyticsService', [
    '$q', '$http',
    function ($q, $http) {
        // const BASE_URL = 'http://127.0.0.1:8006/api/v1/predictive';
        const BASE_URL = 'https://carental-12t8.onrender.com/api/v1/predictive';

        /**
         * Function : Get Admin Predictions
         * @returns {Object} Contains predictions for platform growth, user behavior, market analysis
         */
        this.getAdminPredictions = function () {
            return $http.post(`${BASE_URL}/admin`)
                .then(function(response) {
                    console.log(response.data);
                    return response.data;
                })
                .catch(function(error) {
                    console.error("Error fetching admin predictions:", error);
                    throw error;
                });
        };

        /**
         * Function : Get Owner Predictions
         * @param {string} ownerId - The ID of the owner
         * @param {number} timeframe - Time period in milliseconds
         * @returns {Object} Contains predictions specific to the owner
         */
        this.getOwnerPredictions = function (ownerId, timeframe) {
            return $http.post(`${BASE_URL}/owner`, {
                ownerId: ownerId,
                timeframe: timeframe
            })
            .then(function(response) {
                return response.data;
            })
            .catch(function(error) {
                console.error("Error fetching owner predictions:", error);
                throw error;
            });
        };

        /**
         * Function : Get Car-Specific Predictions
         * @param {string} ownerId - The ID of the owner
         * @param {string} carId - The ID of the specific car
         * @param {number} timeframe - Time period in milliseconds
         * @returns {Object} Contains predictions specific to the car
         */
        this.getCarSpecificPredictions = function (ownerId, carId, timeframe) {
            return $http.post(`${BASE_URL}/owner/car`, {
                ownerId: ownerId,
                carId: carId,
                timeframe: timeframe
            })
            .then(function(response) {
                return response.data;
            })
            .catch(function(error) {
                console.error("Error fetching car-specific predictions:", error);
                throw error;
            });
        };

        /**
         * Function : Get Category-Specific Predictions
         * @param {string} category - The car category
         * @param {number} timeframe - Time period in milliseconds
         * @returns {Object} Contains predictions specific to the category
         */
        this.getCategoryPredictions = function (category, timeframe) {
            return $http.post(`${BASE_URL}/admin/category`, {
                category: category,
                timeframe: timeframe
            })
            .then(function(response) {
                return response.data;
            })
            .catch(function(error) {
                console.error("Error fetching category predictions:", error);
                throw error;
            });
        };
    }
]); 