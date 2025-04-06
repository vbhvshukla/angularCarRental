mainApp.component('ownerSidebar', {
    templateUrl: 'app/components/ownerSidebar/ownersidebar.template.html',
    bindings: {
        isVisible: '=',
        onToggle: '&'
    },
    controller: ['$state', '$transitions', function ($state, $transitions) {
        let $ctrl = this;
        
        /**
         * Variable Declaration and Initialization
         */

        $ctrl.menuItems = [
            { state: 'ownerdashboard', icon: '🏠', label: 'Home' },
            { state: 'ownerdashboard.listedcars', icon: '🚗', label: 'My Cars' },
            { state: 'ownerdashboard.allmessages', icon: '✉️', label: 'My Messages' },
            { state: 'ownerdashboard.analytics', icon: '📊', label: 'Analytics' },
            { state: 'ownerdashboard.manipulatecars', icon: '➕', label: 'List new car' }
        ];

        /**
         * Function : isActive
         * @description Returns if the current state is active.
         * @param {*} state 
         * @returns boolean
         */
        
        $ctrl.isActive = function(state) {
            return $state.includes(state);
        };

        // Close sidebar on state change in mobile view
        $transitions.onSuccess({}, function() {
            if (window.innerWidth < 768) {
                $ctrl.isVisible = false;
            }
        });

        // Toggle sidebar
        $ctrl.toggleSidebar = function() {
            $ctrl.onToggle();
        };
    }]
});