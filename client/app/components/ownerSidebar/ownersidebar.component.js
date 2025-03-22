mainApp.component('ownerSidebar', {
    
    templateUrl: 'app/components/ownerSidebar/ownersidebar.template.html',
    
    controller: ['$state', function($state) {
        
        /**
         * Variable Declaration and Initialization
         */

        let $ctrl = this;
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
    }],
});