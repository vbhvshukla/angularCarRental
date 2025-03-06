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
                }).catch(err=>console.error("User Service :: Error Validating Password"));
        };

        this.updatePassword = function (newPassword) {
            return authService.getUser()
                .then(user => {
                    const hashedPassword = CryptoJS.SHA256(newPassword).toString();
                    return dbService.updateItem('users', {
                        ...user,
                        password: hashedPassword
                    });
                }).catch(err=>console.error("User Service :: Error Updating Password" , err));
        };

        this.approveUser = function (userId) {
            return dbService.getItemByKey('users',userId)
                .then(user => {
                    return dbService.updateItem('users', {
                        ...user,
                        isApproved:true
                    });
                }).catch(err=>console.error("User Service :: Error Approving User" , err));
        };

        this.pendindAllUsers = function(){
           this.getAllUsers().then(function(users){
            const copyUsers = JSON.parse(JSON.stringify(users));
            copyUsers.forEach(function(user){
                user.isApproved = false;
            })

            return dbService.updateAllItems("users",copyUsers);
           })
        }

        // if(true){
        //     this.pendindAllUsers();
        // }

        this.rejectUser = function (userId) {
            return dbService.getItemByKey('users',userId)
                .then(user => {
                    return dbService.updateItem('users', {
                        ...user,
                        isApproved:false
                    });
                }).catch(err=>console.error("User Service :: Error Rejecting User",err));
        };
    }
]);