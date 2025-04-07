mainApp.service('userService', ['$http', '$q', 'authService', 'errorService',
    function ($http, $q, authService, errorService) {

        const BASE_URL = 'http://127.0.0.1:8006/api/v1/user';

        /**
         * @function getUser
         * @description Fetches a user by their ID.
         * @param {*} userId 
         * @returns resolved or rejected promise.
         */
        this.getUser = function (userId) {
            return $http.get(`${BASE_URL}/${userId}`)
                .then(response => response.data)
                .catch(error => errorService.handleError(error, 'UserService :: Fetch User Failed'));
        };

        /**
         * @function getAllUsers
         * @description Fetches all users with pagination.
         * @param {number} page - Current page number
         * @param {number} limit - Number of items per page
         * @returns resolved or rejected promise.
         */
        this.getAllUsers = function (page = 1, limit = 10) {
            return $http.get(`${BASE_URL}`, {
                params: { page, limit }
            })
                .then(response => response.data)
                .catch(error => errorService.handleError(error, 'UserService :: Fetch All Users Failed'));
        };

        /**
         * @function validatePassword
         * @description Validates the user's password by sending it to the backend.
         * @param {*} password 
         * @returns resolved or rejected promise.
         */
        this.validatePassword = function (userId,password) {
            return authService.getUser()
                .then(user => {
                    return $http.post(`${BASE_URL}/validatepassword`, { userId: userId, password })
                        .then(response => response.data.isValid)
                        .catch(error => errorService.handleError(error, 'UserService :: Password Validation Failed'));
                });
        };

        /**
         * @function updatePassword
         * @description Updates the user's password by sending it to the backend.
         * @param {*} newPassword 
         * @returns resolved or rejected promise.
         */
        this.updatePassword = function (newPassword) {
            return authService.getUser()
                .then(user => {
                    return $http.put(`${BASE_URL}/updatepassword/${user.userId}`, { newPassword })
                        .then(response => response.data)
                        .catch(error => errorService.handleError(error, 'UserService :: Password Update Failed'));
                });
        };

        /**
         * @function approveUser
         * @description Approves a user by their ID.
         * @param {*} userId 
         * @returns resolved or rejected promise.
         */
        this.approveUser = function (userId) {
            return $http.put(`${BASE_URL}/approve/${userId}`)
                .then(response => response.data)
                .catch(error => errorService.handleError(error, 'UserService :: Approve User Failed'));
        };

        /**
         * @function pendindAllUsers
         * @description Marks all users as pending approval.
         * @returns resolved or rejected promise.
         */
        this.pendindAllUsers = function () {
            return this.getAllUsers()
                .then(users => {
                    const updatedUsers = users.map(user => ({ ...user, isApproved: false }));
                    return $http.put(`${BASE_URL}/updateall`, updatedUsers)
                        .then(response => response.data)
                        .catch(error => errorService.handleError(error, 'UserService :: Mark All Users Pending Failed'));
                });
        };

        /**
         * @function rejectUser
         * @description Rejects a user by their ID.
         * @param {*} userId 
         * @returns resolved or rejected promise.
         */
        this.rejectUser = function (userId) {
            return $http.put(`${BASE_URL}/reject/${userId}`)
                .then(response => response.data)
                .catch(error => errorService.handleError(error, 'UserService :: Reject User Failed'));
        };
    }
]);