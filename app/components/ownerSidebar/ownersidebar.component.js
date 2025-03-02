mainApp.component('ownerSidebar', {
    templateUrl: 'app/components/ownerSidebar/ownersidebar.template.html',
    controller: ['$state', function($state) {
        let $ctrl = this;
        
        $ctrl.menuItems = [
            { state: 'ownerdashboard', icon: '🏠', label: 'Home' },
            { state: 'ownerdashboard.listedcars', icon: '🚗', label: 'My Cars' },
            { state: 'ownerdashboard.allmessages', icon: '✉️', label: 'My Messages' },
            { state: 'ownerdashboard.analytics', icon: '📊', label: 'Analytics' },
            { state: 'ownerdashboard.manipulatecars', icon: '➕', label: 'List new car' }
        ];

        $ctrl.isActive = function(state) {
            return $state.includes(state);
        };
    }],
});