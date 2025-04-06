/** @file Predictive Analytics Modal Controller */

mainApp.controller('PredictiveAnalyticsModalController', [
    '$scope', '$uibModalInstance', 'predictiveAnalyticsService', 'errorService',
    function ($scope, $uibModalInstance, predictiveAnalyticsService, errorService) {
        /**
         * Variable declarations
         */
        let vm = this;                  // Global variable holds all functions of controller
        vm.isLoading = true;            // Boolean for loader
        vm.error = null;                // Holds error message if any
        vm.data = {                     // Holds all the predictive data
            metrics: {},
            insights: {},
            recommendations: []
        };

        /**
         * Initialization function
         * @function vm.init()
         * @description This function is called when the controller is initialized 
         * and loads the predictive analytics data
         */
        vm.init = function () {
            loadPredictiveData();
        };

        /**
         * Function : Load Predictive Data
         * @description Fetches and processes the predictive analytics data
         */
        function loadPredictiveData() {
            vm.isLoading = true;
            vm.error = null;

            predictiveAnalyticsService.getAdminPredictions()
                .then(function (response) {
                    if (response.success) {
                        processPredictiveData(response.data);
                    } else {
                        vm.error = 'Failed to load predictive data';
                    }
                })
                .catch(function (error) {
                    errorService.handleError(error, 'PredictiveAnalyticsModalController :: Data Load Failed');
                    vm.error = 'Error loading predictive data: ' + error.message;
                })
                .finally(function () {
                    vm.isLoading = false;
                });
        }

        /**
         * Function : Process Predictive Data
         * @param {Object} data - Raw data from the API
         * @description Processes and structures the raw data into required format
         */
        function processPredictiveData(data) {
            var predictions = data.predictions;

            vm.data.metrics = {
                expectedUsers: extractExpectedUsers(predictions),
                revenueProjection: extractRevenueProjection(predictions),
                bidSuccessRate: extractBidSuccessRate(predictions)
            };

            vm.data.insights = {
                retention: extractRetentionInsight(predictions),
                churnRisk: extractChurnRisk(predictions),
                popularCities: extractPopularCities(predictions),
                categoryPerformance: extractCategoryPerformance(predictions)
            };

            vm.data.recommendations = extractRecommendations(predictions);

            console.log(vm.data.recommendations, vm.data.metrics, vm.data.insights);

        }

        /**
         * Function : Extract Expected Users
         * @param {string} text - Raw predictions text
         * @returns {string} Expected user growth range
         */
        function extractExpectedUsers(text) {
            var match = text.match(/Expected User Growth:\s*(\d+)\s*-\s*(\d+)/);
            return match ? match[1] + '-' + match[2] : 'N/A';
        }

        /**
         * Function : Extract Revenue Projection
         * @param {string} text - Raw predictions text
         * @returns {number} Projected revenue
         */
        function extractRevenueProjection(text) {
            var match = text.match(/Revenue Projection:\s*\$(\d{2},\d{3}\.\d{2})\s*-\s*\$(\d{2},\d{3}\.\d{2})/);
            return match ? parseFloat(match[1].replace(/,/g, '')) : 0;
        }

        /**
         * Function : Extract Bid Success Rate
         * @param {string} text - Raw predictions text
         * @returns {string} Bid success rate percentage
         */
        function extractBidSuccessRate(text) {
            var match = text.match(/Bid Success Rate:\s*(\d+\.\d+)%/);
            return match ? match[1] : '0';
        }

        /**
         * Function : Extract Retention Insight
         * @param {string} text - Raw predictions text
         * @returns {string} Customer retention prediction
         */
        function extractRetentionInsight(text) {
            var match = text.match(/Customer Retention Predictions:\s*([^\n]+(?:\n[^\n]+)*)/);
            return match ? match[1].trim() : 'No retention data available';
        }

        /**
         * Function : Extract Churn Risk
         * @param {string} text - Raw predictions text
         * @returns {string} Churn risk assessment
         */
        function extractChurnRisk(text) {
            var match = text.match(/Churn Risk Assessment:\s*([^\n]+(?:\n[^\n]+)*)/);
            return match ? match[1].trim() : 'No churn risk data available';
        }

        /**
         * Function : Extract Popular Cities
         * @param {string} text - Raw predictions text
         * @returns {Array} List of popular cities
         */
        function extractPopularCities(text) {
            var match = text.match(/Popular Cities and Regions:\s*([^\n]+)/);
            if (match) {
                return match[1].split(',').map(city => city.trim());
            }
            return [];
        }

        /**
         * Function : Extract Category Performance
         * @param {string} text - Raw predictions text
         * @returns {Array} List of category performance objects
         */
        function extractCategoryPerformance(text) {
            var match = text.match(/Category Performance Trends:\s*([^\n]+)/);
            if (match) {
                return match[1].split(',').map(cat => {
                    var [name, performance] = cat.split(':').map(s => s.trim());
                    return {
                        name: name,
                        performance: performance
                    };
                });
            }
            return [];
        }

        /**
         * Function : Extract Recommendations
         * @param {string} text - Raw predictions text
         * @returns {Array} List of recommendations
         */
        function extractRecommendations(text) {
            var match = text.match(/Further Recommendations:\s*([\s\S]*?)(?=\n\n|$)/);
            if (match) {
                return match[1]
                    .split('\n')
                    .filter(line => line.trim().startsWith('* '))
                    .map(line => line.replace('* ', '').trim());
            }
            return [];
        }

        /**
         * Function : Close Modal
         * @description Closes the modal dialog
         */
        vm.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        /**
         * Function : Refresh Data
         * @description Reloads the predictive analytics data
         */
        vm.refreshData = function () {
            loadPredictiveData();
        };

        // Initialize the controller
        vm.init();
    }
]); 