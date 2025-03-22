mainApp.component('userSidebar', {

    templateUrl: 'app/components/userSidebar/usersidebar.template.html',

    controller: ['$state', function ($state) {

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
    }],
});