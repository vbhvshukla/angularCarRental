mainApp.service('userService', ['$q', 'dbService', 'authService',
    function ($q, dbService, authService) {
        this.getUser = function (userId) {
            return dbService.getItemByKey('users', userId);
        };

        this.getAllUsers = function () {
            return dbService.getAllItems("users");
        }

        this.validatePassword = function (password) {
            return authService.getUser()
                .then(user => {
                    const hashedPassword = CryptoJS.SHA256(password).toString();
                    return hashedPassword === user.password;
                });
        };

        this.updatePassword = function (newPassword) {
            return authService.getUser()
                .then(user => {
                    const hashedPassword = CryptoJS.SHA256(newPassword).toString();
                    return dbService.updateItem('users', {
                        ...user,
                        password: hashedPassword
                    });
                });
        };
    }
]);