mainApp.factory('userFactory', ['$q', 'authService', 'userService', function ($q, authService, userService) {
    function User(initialData = {}, verificationFile) {
        this._id = initialData._id || null;
        this.email = initialData.email;
        this.password = initialData.password;
        this.role = initialData.role;
        this.username = initialData.username;
        this.isApproved = this.role === "customer" ? true : false;
        this.verificationFile = verificationFile;
    }

    // Validation logic
    function validateUserData(userData, verificationFile) {
        const errors = [];

        if (!userData.username || userData.username.length < 3) {
            errors.push('Username must be at least 3 characters long.');
        }

        if (!userData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
            errors.push('Invalid email format.');
        }

        if (!userData.password || userData.password.length < 6) {
            errors.push('Password must be at least 6 characters long.');
        }

        if (!['customer', 'owner', 'admin'].includes(userData.role)) {
            errors.push('Role must be one of: customer, owner, admin.');
        }

        if (userData.role === 'owner' && !verificationFile) {
            errors.push('Verification file is required for owners.');
        }

        return errors;
    }

    function redirectBasedOnRole(user, $state) {
        if (!user) return true;

        switch (user.role) {
            case 'admin': return $state.go('admindashboard');
            case 'owner': return user.isApproved ? $state.go('ownerdashboard') : $state.go('home');
            case 'customer': return $state.go('userdashboard.profile');
            default: return $state.go('home');
        }
    }

    User.prototype = {
        create: function () {
            const deferred = $q.defer();

            const userData = {
                username: this.username,
                email: this.email,
                password: this.password,
                role: this.role,
                isApproved: this.isApproved
            };

            const errors = validateUserData(userData, this.verificationFile);
            if (errors.length > 0) {
                deferred.reject({ message: 'Validation failed', errors });
            } else {
                authService.register(userData, this.verificationFile)
                    .then(response => deferred.resolve(response))
                    .catch(error => deferred.reject(error));
            }

            return deferred.promise;
        },
        login: function () {
            const deferred = $q.defer();

            if (!this.email || !this.password) {
                deferred.reject({ message: 'Email and password are required for login.' });
            } else {
                authService.login(this.email, this.password)
                    .then(response => deferred.resolve(response))
                    .catch(error => deferred.reject(error));
            }

            return deferred.promise;
        },
        updatePassword: function (newPassword) {
            const deferred = $q.defer();

            if (!newPassword || newPassword.length < 6) {
                deferred.reject({ message: 'Password must be at least 6 characters long.' });
            } else {
                userService.updatePassword(newPassword)
                    .then(response => deferred.resolve(response))
                    .catch(error => deferred.reject(error));
            }

            return deferred.promise;
        },
        validatePassword: function (password) {
            const deferred = $q.defer();

            if (!password) {
                deferred.reject({ message: 'Password is required for validation.' });
            } else {
                userService.validatePassword(this._id, password)
                    .then(response => deferred.resolve(response))
                    .catch(error => deferred.reject(error));
            }

            return deferred.promise;
        },
        approve: function () {
            const deferred = $q.defer();

            if (!this._id) {
                deferred.reject({ message: 'User ID is required for approval.' });
            } else {
                userService.approveUser(this._id)
                    .then(response => deferred.resolve(response))
                    .catch(error => deferred.reject(error));
            }

            return deferred.promise;
        },
        reject: function () {
            const deferred = $q.defer();

            if (!this._id) {
                deferred.reject({ message: 'User ID is required for rejection.' });
            } else {
                userService.rejectUser(this._id)
                    .then(response => deferred.resolve(response))
                    .catch(error => deferred.reject(error));
            }

            return deferred.promise;
        }
    };

    return {
        createUser: function (data, verificationFile) {
            return new User(data, verificationFile); 
        },
        getUserById: function (userId) {
            const deferred = $q.defer();

            if (!userId) {
                deferred.reject({ message: 'User ID is required to fetch user.' });
            } else {
                userService.getUser(userId)
                    .then(response => deferred.resolve(response))
                    .catch(error => deferred.reject(error));
            }

            return deferred.promise;
        },
        logout: function () {
            return authService.logout();
        },
        getCurrentUser: function () {
            return authService.getUser().catch(error => $q.reject(error));
        },
        getAllUsers: function () {
            return userService.getAllUsers();
        },
        redirectBasedOnRole: redirectBasedOnRole
    };
}]);