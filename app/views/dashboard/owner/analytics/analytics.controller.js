mainApp.controller('OwnerAnalyticsController', [
    '$scope', 'analyticsService', 'authService', 'errorService',
    function ($scope, analyticsService, authService, errorService) {
        let vm = this;

        vm.loading = false;
        vm.selectedDays = 30;
        vm.totals = {};
        vm.charts = {};

        vm.lineChartOptions = {
            responsive: true,
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
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
                        stepSize: 1000,
                        min: 0,
                        suggestedMin: 0,
                        maxTicksLimit: 10
                    }
                }]
            },
            tooltips: {
                callbacks: {
                    label: function(tooltipItem, data) {
                        const label = data.datasets[tooltipItem.datasetIndex].label || '';
                        const value = tooltipItem.yLabel;
                        if (label.toLowerCase().includes('revenue')) {
                            return label + ': ₹' + value.toLocaleString();
                        }
                        return label + ': ' + Math.floor(value) + ' days';
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
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        stepSize: 1,
                        precision: 0, 
                        min: 0,
                        suggestedMin: 0,
                        maxTicksLimit: 10, 
                        callback: value => Math.floor(value)
                    }
                }]
            }
        };

        vm.stackedBarOptions = {
            responsive: true,
            scales: {
                xAxes: [{
                    stacked: true,
                    gridLines: {
                        display: false
                    }
                }],
                yAxes: [{
                    stacked: true,
                    ticks: {
                        beginAtZero: true,
                        callback: value => '₹' + value.toLocaleString(),
                        maxTicksLimit: 10,
                        stepSize:500
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'Revenue (₹)'
                    }
                }]
            },
            tooltips: {
                mode: 'index',
                intersect: false,
                callbacks: {
                    label: function(tooltipItem, data) {
                        const label = data.datasets[tooltipItem.datasetIndex].label || '';
                        const value = tooltipItem.yLabel;
                        return label + ': ₹' + value.toLocaleString();
                    }
                }
            },
            legend: {
                position: 'bottom'
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
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        callback: value => '₹' + value.toLocaleString(),
                        maxTicksLimit: 10,
                        stepSize:500
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'Revenue (₹)'
                    }
                }],
                xAxes: [{
                    gridLines: { display: false },
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
                })
                .catch(error => {
                    errorService.handleError('Failed to load analytics', error);
                })
                .finally(() => {
                    vm.loading = false;
                    console.log(vm.totals,vm.charts)
                });
        };

        vm.updateTimeRange = function() {
            const period = vm.selectedDays <= 30 ? 'weekly' : 
                          vm.selectedDays <= 90 ? 'monthly' : 'yearly';
                          
            vm.loading = true;
            authService.getUser()
                .then(user => analyticsService.getOwnerAnalytics(user.userId, vm.selectedDays, period))
                .then(data => {
                    vm.totals = data.totals;
                    vm.charts = data.charts;
                    vm.totals.formattedRevenue = '₹' + vm.totals.totalRevenue.toLocaleString();
                })
                .catch(error => errorService.handleError('Failed to load analytics', error))
                .finally(() => vm.loading = false);
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

        vm.getChartColors = function (type) {
            return vm.colorSchemes[type] || ['#95a5a6'];
        };

        vm.formatUtilization = function (value) {
            return value.toFixed(1) + '%';
        };

        vm.formatDate = function (date) {
            return new Date(date).toLocaleDateString();
        };

        vm.getTrend = function (current, previous) {
            if (!previous) return 'neutral';
            return current > previous ? 'up' : 'down';
        };
    }
]);