mainApp.controller('AdminAnalyticsController', [
    '$scope', 'analyticsService',
    function ($scope, analyticsService) {
        var vm = this;
        vm.selectedTimeRange = 30;
        vm.loading = false;
        vm.chartInstances = {};

        function renderCharts(charts) {
            //If this renderCharts is called again with other values then destory all the chartInstances already created.
            Object.entries(vm.chartInstances).forEach(([, chart]) => {
                chart.destroy();
            });

            if (charts.totalRevenuePerCategory) {
                vm.chartInstances.totalRevenuePerCategoryChart = new Chart(
                    document.getElementById('totalRevenuePerCategoryChart'),
                    {
                        type: 'bar',
                        data: charts.totalRevenuePerCategory,
                        options: getChartOptions('revenue')
                    }
                );
            }

            const chartConfigs = {
                totalRevenuePerCity: { id: 'totalRevenuePerCityChart', type: 'bar' },
                averageRevenuePerUser: { id: 'averageRevenuePerUserChart', type: 'bar' },
                bookingsOverTime: { id: 'bookingsOverTimeChart', type: 'line' },
                carsPerCategory: { id: 'carsPerCategoryChart', type: 'pie' },
                highestRatedCarCategoryWise: { id: 'highestRatedCarCategoryChart', type: 'bar' },
                bidsPerCategory: { id: 'bidsPerCategoryChart', type: 'bar' },
                totalBiddedPricePerCategory: { id: 'totalBiddedPricePerCategoryChart', type: 'bar' },
                carsPerCity: { id: 'carsPerCityChart', type: 'pie' },
                revenueTrends: { id: 'revenueTrendsChart', type: 'line' }
            };

            Object.entries(chartConfigs).forEach(([key, config]) => {
                if (charts[key]) {
                    vm.chartInstances[config.id] = new Chart(
                        document.getElementById(config.id),
                        {
                            type: config.type,
                            data: charts[key],
                            options: getChartOptions(key)
                        }
                    );
                }
            });
        }

        function getChartOptions(chartType) {
            const baseOptions = {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0,
                            callback: function(value) {
                                if (chartType.includes('revenue')) {
                                    return '₹' + Math.round(value).toLocaleString();
                                }
                                return Math.round(value);
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.dataset.label || '';
                                const value = Math.round(context.parsed.y);
                                if (chartType.includes('revenue')) {
                                    return `${label}: ₹${value.toLocaleString()}`;
                                }
                                return `${label}: ${value}`;
                            }
                        }
                    }
                }
            };

            if (chartType === 'carsPerCategory' || chartType === 'carsPerCity') {
                return {
                    ...baseOptions,
                    plugins: {
                        ...baseOptions.plugins,
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    //context.parsed is basically the values of the data points
                                    const value = Math.round(context.parsed);
                                    return `${label}: ${value}`;
                                }
                            }
                        }
                    }
                };
            }

            return baseOptions;
        }

        vm.loadAnalyticsData = function () {
            vm.loading = true;
            analyticsService.getAdminAnalytics(vm.selectedTimeRange)
                .then(data => {
                    vm.cards = data.cards;
                    vm.charts = data.charts;
                    renderCharts(data.charts);
                })
                .finally(() => {
                    vm.loading = false;
                });
        };

        $scope.$on('$destroy', function() {
            Object.values(vm.chartInstances).forEach(chart => chart.destroy());
        });
    }
]);