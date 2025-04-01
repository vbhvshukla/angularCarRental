mainApp.component('userSidebar', {
    templateUrl: 'app/components/userSidebar/usersidebar.template.html',
    bindings: {
        isVisible: '=',
        onToggle: '&'
    },
    controller: ['$state', '$transitions', function ($state, $transitions) {
        /**
         * Variable Declarations and Initializations
         * @var $ctrl : Alias for view modal for this component.
         * @var $ctrl.menuItems : Holds all the navigation links
         */
        let $ctrl = this;
        $ctrl.menuItems = [
            { state: 'userdashboard.profile', icon: '🏠', label: 'My Profile' },
            { state: 'userdashboard.bookings', icon: '📅', label: 'My Bookings' },
            { state: 'userdashboard.messages', icon: '✉️', label: 'My Messages' },
            { state: 'userdashboard.bids', icon: '💰', label: 'My Biddings' }
        ];

        /**
         * Function : Check if the state is active or not.
         * @param {*} state 
         * @returns Boolean.
         */
        $ctrl.isActive = function (state) {
            return $state.includes(state);
        };

        // Close sidebar on state change in mobile view
        $transitions.onSuccess({}, function() {
            if (window.innerWidth < 768) {
                $ctrl.isVisible = false;
            }
        });

        /**
         * Function to toggle sidebar visibility
         */
        $ctrl.toggleSidebar = function() {
            $ctrl.onToggle();
        };
    }]
});