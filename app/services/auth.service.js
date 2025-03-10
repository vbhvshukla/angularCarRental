mainApp.service('authService', ['$q', '$state', '$cookies', 'dbService', 'idGenerator', 'schemaValidator', 'errorService',
     function  ($q, $state, $cookies, dbService, idGenerator, schemaValidator, errorService) {

        //User Schema defining for validation
        //(Used in addition and updation of user)
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

        //Returns a boolean depending upon there exists
        //a userId in the cookie.
        this.checkAuth = function () {
            return !!$cookies.get('userId');
        };

        //Returns a promise for the user fetched by it's
        //id stored in the cookie.

        this.getUser = function () {
            const deferred = $q.defer();
            const userId = $cookies.get('userId');

            if (!userId) {
                deferred.resolve(null);
                return deferred.promise;
            }

            dbService.getItemByKey("users", userId)
                .then(user => deferred.resolve(user))
                .catch(error => errorService.handleError(error, 'AuthService :: User Fetch Failed'));

            return deferred.promise;
        };

        //Returns role of the user ([admin,customer,owner])
        this.getUserRole = function () {
            return this.getUser().then(user => user ? user.role : null);
        };

        //Returns a promise with user object upon successful login
        //Sets the cookie with userId and an expiry of 1 day from the day of logging in.
        //Dependency -> dbService,CryptoJS,errorService || $cookies,$q
        this.login = function (email, password) {
            const deferred = $q.defer();
            dbService.getItemByIndex("users", "email", email)
                .then((user) => {
                    if (!user) {
                        return errorService.handleError("Email not found. Please register first.", 'AuthService :: Login Failed');
                    }

                    const hashedPassword = CryptoJS.SHA256(password).toString();
                    if (hashedPassword !== user.password) {
                        return errorService.handleError("Invalid password", 'AuthService :: Login Failed');
                    }

                    if (user.role === "owner" && !user.isApproved) {
                        return errorService.handleError("Account pending approval.", 'AuthService :: Access Denied');
                    }

                    const expires = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
                    $cookies.put("userId", user.userId, { expires: expires });

                    errorService.logSuccess('Login successful!', 'AuthService :: Authentication');
                    deferred.resolve(user);
                })
                .catch(error => errorService.handleError('AuthService :: Login Failed', error));

            return deferred.promise;
        };

        //Logout clears cookies and redirects to home
        this.logout = function () {
            const deferred = $q.defer();
            try {
                $cookies.remove('userId');
                $state.go('home');
                errorService.logInfo('AuthService :: Authentication', 'User logged out successfully');
                deferred.resolve();
            } catch (error) {
                errorService.handleError('AuthService :: Logout Failed', error);
                deferred.reject(error);
            }

            return deferred.promise;
        };

        //Register Service (Params required -> User Data Object and Verification File)
        this.register = function (userData, verificationFile) {
            const deferred = $q.defer();

            const user = {
                userId: idGenerator.generate(),
                username: userData.username,
                email: userData.email,
                password: CryptoJS.SHA256(userData.password).toString(),
                role: userData.role,
                isApproved: userData.role !== 'owner',
                avgRating: 0,
                ratingCount: 0,
                paymentPreference: '',
                verificationFile: ''
            };

            //File Handler
            const handleFileUpload = () => {
                if (userData.role === 'owner' && verificationFile) {
                    return new $q((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            user.verificationFile = e.target.result;
                            resolve();
                        };
                        reader.onerror = (e) => {
                            reject('File upload failed');
                        };
                        reader.readAsDataURL(verificationFile);
                    });
                }
                return $q.resolve();
            };
            
            handleFileUpload()
                .then(() => schemaValidator.validate(user, userSchema))
                .then(() => dbService.getItemByIndex("users", "email", user.email))
                .then(existingUser => {
                    if (existingUser) {
                        return errorService.handleError("Email already registered", 'AuthService :: Registration Failed');
                    }
                    return dbService.addItem("users", user);
                })
                .then(() => {
                    errorService.logSuccess('Registration successful!', 'AuthService :: Authentication');
                    deferred.resolve();
                })
                .catch(error => {
                    errorService.handleError(error, 'AuthService :: Registration Failed');
                    deferred.reject(error);
                });

            return deferred.promise;
        };

        //Seed admin user
        this.injectAdmin = function () {
            const deferred = $q.defer();

            const adminUser = {
                userId: idGenerator.generate(),
                username: 'admin',
                email: 'admin@example.com',
                password: CryptoJS.SHA256('Rishu578@').toString(),
                role: 'admin',
                isApproved: true,
                avgRating: 0,
                ratingCount: 0,
                paymentPreference: '',
                verificationFile: ''
            };

            dbService.getItemByIndex("users", "email", adminUser.email)
                .then(existingAdmin => {
                    if (existingAdmin) {
                        return errorService.handleError("Admin user already exists", 'AuthService :: Admin Injection Failed');
                    }
                    return dbService.addItem("users", adminUser);
                })
                .then(() => {
                    errorService.logSuccess('Admin user created successfully!', 'AuthService :: Admin Injection');
                    deferred.resolve();
                })
                .catch(error => {
                    errorService.handleError(error, 'AuthService :: Admin Injection Failed');
                    deferred.reject(error);
                });

            return deferred.promise;
        };

        //Check user roles
        this.checkAdmin = () => this.getUserRole().then(role => role === 'admin');
        this.checkOwner = () => this.getUserRole().then(role => role === 'owner');
        this.checkCustomer = () => this.getUserRole().then(role => role === 'customer');
        this.checkOwnerApproved = () => this.getUser().then(user => user && user.role === 'owner' && user.isApproved);
    }
]);