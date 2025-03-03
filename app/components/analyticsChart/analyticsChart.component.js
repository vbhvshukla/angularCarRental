mainApp.component('analyticsChart', {
    
    //Binding is basically the input properties that the component receieve from the calling component
    bindings: {
        chartType: '@', //used for strings
        chartData: '<', //one way binding for (object/array)[component can only read chartData not modify it]
        chartLabels: '<',
        chartOptions: '<',
        chartSeries: '<',
        title: '@'
    },
    templateUrl: 'app/components/analyticsChart/analyticsChart.template.html',
    controller: function() {
        let $ctrl = this;

        //on init basically is a lifecycle hook 
        //and it is called when the component is 
        //+initialized

        $ctrl.$onInit = function() {
            $ctrl.chartOptions = $ctrl.chartOptions || getDefaultOptions($ctrl.chartType);
        };

        function getDefaultOptions(type) {
            //set the baseoptions like responsiveness,
            //maintainaspectratio to true/false.
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