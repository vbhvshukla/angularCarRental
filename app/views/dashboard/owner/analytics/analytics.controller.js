mainApp.controller('OwnerAnalyticsController', [
    '$scope', 'analyticsService', 'authService', 'errorService',
    function ($scope, analyticsService, authService, errorService) {
        let vm = this;
        vm.chartInstances = {};

        vm.loading = false;
        vm.selectedDays = 30;
        vm.totals = {};
        vm.charts = {};

        vm.lineChartOptions = {
            responsive: true,
            scales: {
                y: { 
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            try {
                                const label = this.chart.data.datasets[0].label || '';
                                if (label.toLowerCase().includes('revenue')) {
                                    return '₹' + value.toLocaleString();
                                }
                                return Math.floor(value) + ' days';
                            } catch (e) {
                                return value;
                            }
                        },
                        stepSize: 1000
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.raw;
                            if (label.toLowerCase().includes('revenue')) {
                                return label + ': ₹' + value.toLocaleString();
                            }
                            return label + ': ' + Math.floor(value) + ' days';
                        }
                    }
                }
            }
        };

        vm.pieChartOptions = {
            responsive: true,
            legend: { position: 'bottom' }
        };

        vm.barChartOptions = {
            responsive: true,
            scales: {
                y: { 
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        precision: 0, 
                        callback: value => Math.floor(value)
                    }
                }
            }
        };

        vm.stackedBarOptions = {
            responsive: true,
            scales: {
                x: { 
                    stacked: true,
                    grid: {
                        display: false
                    }
                },
                y: {  
                    stacked: true,
                    beginAtZero: true,
                    ticks: {
                        callback: value => '₹' + value.toLocaleString(),
                        stepSize: 500
                    },
                    title: {
                        display: true,
                        text: 'Revenue (₹)'
                    }
                }
            },
            plugins: {
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.raw;
                            return label + ': ₹' + value.toLocaleString();
                        }
                    }
                },
                legend: {
                    position: 'bottom'
                }
            }
        };

        vm.chartOptions = {
            responsive: true,
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        callback: value => '₹' + value.toLocaleString(),
                        maxTicksLimit: 10
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'Revenue (₹)'
                    }
                }],
                xAxes: [{
                    gridLines: {
                        display: false
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'Time Period'
                    }
                }]
            },
            tooltips: {
                callbacks: {
                    label: function(tooltipItem, data) {
                        const label = data.datasets[tooltipItem.datasetIndex].label || '';
                        const value = tooltipItem.yLabel;
                        return label + ': ₹' + value.toLocaleString();
                    }
                }
            }
        };

        vm.revenueChartOptions = {
            responsive: true,
            scales: {
                y: {  
                    beginAtZero: true,
                    ticks: {
                        callback: value => '₹' + value.toLocaleString(),
                        stepSize: 500
                    },
                    title: {
                        display: true,
                        text: 'Revenue (₹)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    title: { 
                        display: true,
                        text: 'Time Period'
                    }
                }
            },
            plugins: { 
                tooltip: {
                    callbacks: {
                        label: function(context) { 
                            const label = context.dataset.label || '';
                            const value = context.raw;
                            return label + ': ₹' + value.toLocaleString();
                        }
                    }
                }
            }
        };

        vm.colorSchemes = {
            revenue: ['#3498db', '#e67e22'],       
            bookings: ['#2ecc71'],
            bids: ['#27ae60', '#f1c40f', '#e74c3c'],
            cars: ['#9b59b6'],
            rentalTypes: ['#3498db', '#e67e22'],
            utilization: ['#2c3e50'],
            renters: ['#f1c40f'],                  
            duration: ['#8e44ad', '#2c3e50']       
        };

        vm.init = function () {
            vm.loading = true;

            authService.getUser()
                .then(user => {
                    vm.currentUser = user;
                    return analyticsService.getOwnerAnalytics(user.userId, vm.selectedDays);
                })
                .then(data => {
                    vm.totals = data.totals;
                    vm.charts = data.charts;
                    vm.totals.formattedRevenue = '₹' + vm.totals.totalRevenue.toLocaleString();
                    renderCharts(data.charts);
                })
                .catch(error => {
                    errorService.handleError('Failed to load analytics', error);
                })
                .finally(() => {
                    vm.loading = false;
                });
        };

        function createChart(canvasId, type, data, options) {
            const ctx = document.getElementById(canvasId).getContext('2d');
            
            if (vm.chartInstances[canvasId]) {
                vm.chartInstances[canvasId].destroy();
            }

            vm.chartInstances[canvasId] = new Chart(ctx, {
                type: type,
                data: data,
                options: options
            });
        }

        function renderCharts(data) {
            createChart('monthlyRevenueChart', 'line', data.revenue, vm.revenueChartOptions);
            createChart('bookingsPerCarChart', 'bar', data.bookings, vm.barChartOptions);
            createChart('carUtilizationChart', 'bar', data.carUtilization, vm.barChartOptions);
            createChart('activeRentersChart', 'bar', data.activeRenters, vm.barChartOptions);
            createChart('avgRevenueChart', 'line', data.avgRevenueByType, vm.revenueChartOptions);
            createChart('revenueByTypeChart', 'bar', {labels: data.revenueOverTime.labels,datasets: data.revenueOverTime.datasets}, vm.stackedBarOptions);
            createChart('avgRevenueTrendsChart', 'line', data.avgRevenueOverTime, vm.revenueChartOptions);
            createChart('avgBidAmountChart', 'bar', data.avgBidAmount, vm.revenueChartOptions);
        }

        vm.updateTimeRange = function() {      
            vm.loading = true;
            authService.getUser()
                .then(user => analyticsService.getOwnerAnalytics(user.userId, vm.selectedDays))
                .then(data => {
                    vm.totals = data.totals;
                    vm.charts = data.charts;
                    vm.totals.formattedRevenue = '₹' + vm.totals.totalRevenue.toLocaleString();
                    renderCharts(data.charts);
                })
                .catch(error => errorService.handleError('Failed to load analytics', error))
                .finally(() => vm.loading = false);
        };

        vm.getChartColors = function (type) {
            return vm.colorSchemes[type] || ['#95a5a6'];
        };

        vm.formatUtilization = function (value) {
            return value.toFixed(1) + '%';
        };

        vm.formatDate = function (date) {
            return new Date(date).toLocaleDateString();
        };

        $scope.$on('$destroy', function() {
            Object.values(vm.chartInstances).forEach(chart => chart.destroy());
        });
    }
]);