mainApp.component('analyticsChart', {
    bindings: {
        chartType: '@',
        chartData: '<',
        chartLabels: '<',
        chartOptions: '<',
        chartSeries: '<',
        title: '@'
    },
    templateUrl: 'app/components/analyticsChart/analyticsChart.template.html',
    controller: function() {
        let $ctrl = this;

        $ctrl.$onInit = function() {
            $ctrl.chartOptions = $ctrl.chartOptions || getDefaultOptions($ctrl.chartType);
        };

        function getDefaultOptions(type) {
            const baseOptions = {
                responsive: true,
                maintainAspectRatio: false
            };

            switch(type) {
                case 'line':
                    return {
                        ...baseOptions,
                        scales: {
                            yAxes: [{
                                ticks: { beginAtZero: true }
                            }]
                        }
                    };
                case 'pie':
                    return {
                        ...baseOptions,
                        legend: { position: 'bottom' }
                    };
                case 'bar':
                    return {
                        ...baseOptions,
                        scales: {
                            yAxes: [{
                                ticks: { beginAtZero: true }
                            }]
                        }
                    };
                default:
                    return baseOptions;
            }
        }
    }
});