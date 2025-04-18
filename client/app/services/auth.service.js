mainApp.service('authService', ['$http', '$q', '$state', '$cookies', 'errorService',
    function ($http, $q, $state, $cookies, errorService) {
        // const BASE_URL = 'http://127.0.0.1:8006/api/v1/auth';
        const BASE_URL = 'https://carental-12t8.onrender.com/api/v1/auth';
        
        /**
         * User Schema's for validations
         */
        const userSchema = {
            userId: { type: 'string', required: true },
            username: { type: 'string', required: true, minLength: 3 },
            email: { type: 'string', required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
            password: { type: 'string', required: true, minLength: 6 },
            role: { type: 'string', required: true, enum: ['customer', 'owner', 'admin'] },
            isApproved: { type: 'boolean', default: false },
            avgRating: { type: 'number', default: 0 },
            ratingCount: { type: 'number', default: 0 },
            paymentPreference: { type: 'string', default: '' },
            verificationFile: {
                type: 'string',
                required: function () { return this.role === 'owner'; }
            }
        };

        /**
         * Checks if a user is authenticated or not.
         * @returns Boolean
         */

        this.checkAuth = function () {
            return !!$cookies.get('userId');
        };

        /**
         * @function getUser()
         * @description Get The Current loggeed in User
         * @returns resolved or rejected promise.
         */

        this.getUser = function () {
            const deferred = $q.defer();
            $http.get(`${BASE_URL}/getcurrentuser`)
                .then(response => deferred.resolve(response.data.user))
                .catch(error => {
                    if (error.status === 401) {
                        this.regenerateToken()
                            .then(() => this.getUser().then(user => deferred.resolve(user)))
                            .catch(err => deferred.reject(err));
                    } else {
                        deferred.reject(error);
                    }
                });
            return deferred.promise;
        };

        /**
         * @function getUserRole()
         * @description Get's the currently logged in user's role
         * @returns resolved or rejected promise.
         */

        this.getUserRole = function () {
            return this.getUser().then(user => user ? user.role : null);
        };

        /**
         * @function login()
         * @description logs in a user with given id password.
         * @param {*} email 
         * @param {*} password 
         * @returns resolved or rejected promise containing user.
         */

        this.login = function (email, password) {
            const deferred = $q.defer();
            const user = { email, password };
            $http.post(`${BASE_URL}/login`, user, {
                withCredentials: true,
            }).then((response) => {
                deferred.resolve(response);
            }).catch((error) => {
                deferred.reject(error);
            })
            return deferred.promise;
        };

        /**
         * @function logout()
         * @description logs out a user.
         * @returns resolved or rejected promise.
         */

        this.logout = function () {
            const deferred = $q.defer();
            $http.post(`${BASE_URL}/logout`, { withCredentials: true })
                .then(() => {
                    $state.go('home');
                    errorService.logInfo('AuthService :: Authentication', 'User logged out successfully');
                    deferred.resolve();
                })
                .catch((error) => {
                    errorService.handleError('AuthService :: Logout Failed', error);
                    deferred.reject(error);
                });
            return deferred.promise;
        };

        /**
         * @function register()
         * @description registers a user in db.
         * @param {*} userData 
         * @param {*} verificationFile 
         * @returns resolved or rejected promise.
         */

        this.register = function (userData, verificationFile) {
            const deferred = $q.defer();

            const formData = new FormData();
            formData.append('username', userData.username);
            formData.append('email', userData.email);
            formData.append('password', userData.password);
            formData.append('role', userData.role);
            formData.append('isApproved', userData.role !== 'owner');
            formData.append('verificationFile', verificationFile); // Attach the file

            $http.post(`${BASE_URL}/register`, formData, {
                withCredentials: true,
                headers: {
                    'Content-Type': undefined
                },
            })
                .then(response => {
                    deferred.resolve(response.data);
                })
                .catch(error => {
                    errorService.handleError(error, "AuthService :: Error Register User");
                    deferred.reject(error);
                });

            return deferred.promise;
        };

        /**
         * @function regenerateToken()
         * @description Regenerates the access token using the refresh token.
         * @returns resolved or rejected promise.
         */
        this.regenerateToken = function () {
            const deferred = $q.defer();
            $http.get(`${BASE_URL}/regenerateToken`, { withCredentials: true })
                .then((response) => {
                    deferred.resolve(response.data);
                })
                .catch((error) => {
                    errorService.handleError('AuthService :: Token Regeneration Failed', error);
                    deferred.reject(error);
                });
            return deferred.promise;
        };

        /**
         * @function checkAdmin
         * @function checkOwner
         * @function checkCustomer
         * @function checkOwnerApproved
         * @description check the role of the user.
         * @returns 
         */

        this.checkAdmin = () => this.getUserRole().then(role => role === 'admin');
        this.checkOwner = () => this.getUserRole().then(role => role === 'owner');
        this.checkCustomer = () => this.getUserRole().then(role => role === 'customer');
        this.checkOwnerApproved = () => this.getUser().then(user => user && user.role === 'owner' && user.isApproved);
    }
]);