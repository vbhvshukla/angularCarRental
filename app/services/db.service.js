mainApp.service('dbService', function ($q) {
    const dbName = "angularCarRental";
    const dbVersion = 10;
    let db = null;

    //For Version Change - Migrating Data

    const users = [];
    const cars = [];
    const bookings = [];
    const bids = [];
    const messages = [];
    const conversations = [];
    const carAvailibility = [];
    const categories = [];


    //Schema for creating IDB.

    const schema = {
        users: {
            store: { keyPath: "userId" },
            indexes: [
                {
                    name: "email", keyPath: "email", options: { unique: true }
                }
            ]
        },
        cars: {
            store: { keyPath: "carId" },
            indexes: [
                {
                    name: "ownerId",
                    keyPath: "owner.userId"
                },
                {
                    name: "categoryId",
                    keyPath: "category.categoryId"
                },
                {
                    name: "city",
                    keyPath: "city"
                }
            ]
        },
        bids: {
            store: { keyPath: "bidId" },
            indexes: [
                {
                    name: "carId",
                    keyPath: "car.carId"
                },
                {
                    name: "userId",
                    keyPath: "user.userId"
                },
                {
                    name: "ownerId",
                    keyPath: "car.owner.userId"
                },
                {
                    name: "fromTimestamp",
                    keyPath: "fromTimestamp"
                }
            ]
        },
        bookings: {
            store: { keyPath: "bookingId" },
            indexes: [
                {
                    name: "carId",
                    keyPath: "bid.car.carId"
                },
                {
                    name: "userId",
                    keyPath: "bid.user.userId"
                },
                {
                    name: "ownerId",
                    keyPath: "bid.car.owner.userId"
                },
                {
                    name: "fromTimestamp",
                    keyPath: "fromTimestamp"
                },
            ]
        },
        messages: {
            store: { keyPath: "messageId" },
            indexes: [
                {
                    name: "chatId",
                    keyPath: "chatId"
                },
                {
                    name: "fromUserId",
                    keyPath: "fromUser.userId"
                },
                {
                    name: "toUserId",
                    keyPath: "toUser.userId"
                },
                {
                    name: "createdAt",
                    keyPath: "createdAt"
                }
            ]
        },
        conversations: {
            store: { keyPath: "chatId" },
            indexes: [
                {
                    name: "ownerId",
                    keyPath: "owner.userId"
                },
                {
                    name: "userId",
                    keyPath: "user.userId"
                },
                {
                    name: "lastTimestamp",
                    keyPath: "lastTimestamp"
                }
            ]
        },
        carAvailibility: {
            store: { keyPath: "carId" },
            indexes: [
                {
                    name: "fromTimestamp",
                    keyPath: "fromTimestamp"
                },
                {
                    name: "toTimestamp",
                    keyPath: "toTimestamp"
                }
            ]
        },
        categories: {
            store: { keyPath: "categoryId" },
            indexes: [
                {
                    name: "name",
                    keyPath: "name",
                    options: { unique: true }
                }
            ]
        },

    }

    function openDb() {
        const deferred = $q.defer();

        if (db) {
            deferred.resolve(db);
            return deferred.promise;
        }

        const request = indexedDB.open(dbName, dbVersion);

        request.onupgradeneeded = function (event) {
            console.log("Version Triggered :: ", event);
            db = event.target.result;

            Object.keys(schema).forEach(storeName => {
                const storeConfig = schema[storeName];

                //If there is a store that already has the name
                //of the schema migrate the data first to the above
                //defined array and then delete the object
                //store when the transaction completes.

                if (db.objectStoreNames.contains(storeName)) {
                    const migrateRequest = event.target.transaction.objectStore(storeName).openCursor();
                    migrateRequest.onsuccess = function () {
                        const eventCursor = migrateRequest.result;
                        if (eventCursor) {
                            const data = eventCursor.value;
                            console.log(data);
                            //Get the storename and push data accordingly
                            switch (storeName) {
                                case 'users':
                                    users.push(data);
                                    break;
                                case 'cars':
                                    cars.push(data);
                                    break;
                                case 'bids':
                                    bids.push(data);
                                    break;
                                case 'bookings':
                                    bookings.push(data);
                                    break;
                                case 'messages':
                                    messages.push(data);
                                    break;
                                case 'conversations':
                                    conversations.push(data);
                                    break;
                                case 'carAvailibility':
                                    carAvailibility.push(data);
                                    break;
                                case 'categories':
                                    categories.push(data);
                                    break;
                            }
                            eventCursor.continue();
                        }
                    };

                    migrateRequest.onerror = function (errorEvent) {
                        console.error('Cursor migration failed for store: ' + storeName, errorEvent);
                    };

                    //After the transaction is completed delete the existing
                    //object store and create a new store with the same config
                    //as schema

                    migrateRequest.oncomplete = function () {
                        console.log(users, cars, bookings)
                        db.deleteObjectStore(storeName);
                        const newStore = db.createObjectStore(storeName, storeConfig.store);
                        createIndexes(newStore, storeConfig.indexes);
                    };
                } else {
                    //if the store doesn't exist create it
                    const newStore = db.createObjectStore(storeName, storeConfig.store);
                    createIndexes(newStore, storeConfig.indexes);
                }
            });
        };

        request.onerror = function (event) {
            deferred.reject(event.target.error);
        };

        request.onsuccess = function (event) {
            db = event.target.result;
            deferred.resolve(db);

            //----------Prompts the user running the older version to update and sync the DB--------------
            /*   db.onversionchange = function () {
                     if(window.confirm("DB Version outdated :: Do you want to change DB Version now?")){
                         // db.close();
                     }
                  console.log("Version changed")
              }
             */
        };

        return deferred.promise;
    }

    function createIndexes(store, indexes) {
        if (indexes) {
            indexes.forEach((index) => {
                if (!store.indexNames.contains(index.name)) {
                    store.createIndex(index.name, index.keyPath, index.options);
                }
            })
        }
    }

    function getObjectStore(storeName, mode) {
        const transaction = db.transaction([storeName], mode);
        return transaction.objectStore(storeName);
    }

    this.init = function () {
        return openDb();
    },

        this.addItem = function (storeName, item) {
            const deferred = $q.defer();
            openDb().then(() => {
                const store = getObjectStore(storeName, "readwrite");
                const request = store.add(item);
                request.onsuccess = () => deferred.resolve(item);
                request.onerror = (event) => deferred.reject(event.target.error);
            }).catch((err) => {
                deferred.reject(err);
            })
            return deferred.promise;
        },

        this.updateItem = function (storeName, item) {
            const deferred = $q.defer();
            openDb().then(() => {
                const store = getObjectStore(storeName, "readwrite");
                const request = store.put(item);
                request.onsuccess = () => deferred.resolve(item);
                request.onerror = (event) => deferred.reject(event.target.error);
            }).catch((err) => {
                deferred.reject(err);
            })
            return deferred.promise;
        },

        this.deleteItem = function (storeName, key) {
            const deferred = $q.defer();
            openDb().then(() => {
                const store = getObjectStore(storeName, "readwrite");
                const request = store.delete(key);
                request.onsuccess = () => deferred.resolve(true);
                request.onerror = (event) => deferred.reject(event.target.error);
            }).catch((err) => {
                deferred.reject(err);
            })
            return deferred.promise;
        },

        this.getItemByKey = function (storeName, key) {
            const deferred = $q.defer();
            openDb().then(() => {
                const store = getObjectStore(storeName, "readonly");
                const request = store.get(key);
                request.onsuccess = () => deferred.resolve(request.result);
                request.onerror = (event) => deferred.reject(event.target.error);
            }).catch((err) => {
                deferred.reject(err);
            })
            return deferred.promise;
        },

        this.getItemByIndex = function (storeName, indexName, key) {
            const deferred = $q.defer();
            openDb().then(() => {
                const store = getObjectStore(storeName, "readonly");
                const index = store.index(indexName);
                const request = index.get(key);
                request.onsuccess = () => deferred.resolve(request.result);
                request.onerror = (event) => deferred.reject(event.target.error);
            }).catch((err) => {
                deferred.reject(err);
            })
            return deferred.promise;
        },

        this.getAllItemsByIndex = function (storeName, indexName, key) {
            const deferred = $q.defer();
            openDb().then(() => {
                const store = getObjectStore(storeName, "readonly");
                const index = store.index(indexName);
                const request = index.getAll(key);
                request.onsuccess = () => deferred.resolve(request.result || []);
                request.onerror = (event) => deferred.reject(event.target.error);
            })
            return deferred.promise;
        },

        this.getAllItems = function (storeName, limit = 1000) {
            
            const deferred = $q.defer();
            openDb()
                .then(() => {
                    try {
                        const store = getObjectStore(storeName, "readonly");

                        const items = [];
                        let count = 0;
                        const request = store.openCursor();
                        request.onsuccess = (event) => {
                            const cursor = event.target.result;
                            if (cursor && count < limit) {
                                items.push(cursor.value);
                                count++;
                                cursor.continue();
                            } else {
                                deferred.resolve(items);
                            }
                        };
                        request.onerror = (event) => deferred.reject(event.target.error);

                    } catch (error) {
                        deferred.reject(error);
                    }
                })
                .catch(error => {
                    console.error('Error in getAllItems:', error);
                    return deferred.reject(error);
                });
            return deferred.promise;
        },

        this.getItemsWithPagination = function (storeName, page = 1, itemsPerPage = 10) {
            const deferred = $q.defer();
            openDb().then(() => {
                const store = getObjectStore(storeName, "readonly");
                const items = [];
                let count = 0;
                const start = (page - 1) * itemsPerPage;
                const end = start + itemsPerPage;
                const request = store.openCursor();
                request.onsuccess = (event) => {
                    const cursor = event.target.result;
                    if (cursor) {
                        if (count >= start && count < end) {
                            items.push(cursor.value);
                        }
                        count++;
                        if (count < end) cursor.continue();
                        else {
                            console.log()
                            deferred.resolve(items)
                        };
                    } else {
                        deferred.resolve(items);
                    }
                };
                request.onerror = (event) => deferred.reject(event.target.error);
            }).catch((error) => {
                console.error('Error in getAllItems:', error);
                return deferred.reject(error);
            })
            return deferred.promise;
        },

        this.getTotalItems = function (storeName) {
            return openDb().then(() => {
                const deferred = $q.defer();
                const store = getObjectStore(storeName, "readonly");
                const request = store.count();
                request.onsuccess = () => deferred.resolve(request.result);
                request.onerror = (event) => deferred.reject(event.target.error);
                return deferred.promise;
            });
        },

        this.getItemsByTimeRange = function (storeName, indexName, key, days) {
            return openDb().then(() => {
                const deferred = $q.defer();
                const store = getObjectStore(storeName, "readonly");
                const index = store.index(indexName);
                const range = IDBKeyRange.only(key);
                const result = [];
                const cutoffDate = new Date();
                cutoffDate.setDate(cutoffDate.getDate() - days);

                const request = index.openCursor(range);
                request.onsuccess = (event) => {
                    const cursor = event.target.result;
                    if (cursor) {
                        const itemDate = new Date(cursor.value.createdAt);
                        if (itemDate >= cutoffDate) {
                            result.push(cursor.value);
                        }
                        cursor.continue();
                    } else {
                        deferred.resolve(result);
                    }
                };
                request.onerror = (event) => deferred.reject(event.target.error);
                return deferred.promise;
            });
        },

        this.getAllItemsByTimeRange = function (storeName, indexName, days) {
            return openDb().then(() => {
                const deferred = $q.defer();
                const store = getObjectStore(storeName, "readonly");
                const index = store.index(indexName);
                const result = [];
                //we are getting only those items which lies on or before so this is the cutoff date.
                const cutoffDate = new Date();
                //getDate returns the day of the month then subrtract the number of days and set the cutOffDate again to the date after subtraction
                cutoffDate.setDate(cutoffDate.getDate() - days);

                const request = index.openCursor();
                request.onsuccess = (event) => {
                    const cursor = event.target.result;
                    if (cursor) {
                        //now if createdAt is greater than the cutoffdate take it in else contninue
                        const itemDate = new Date(cursor.value.createdAt);
                        if (itemDate >= cutoffDate) {
                            result.push(cursor.value);
                        }
                        cursor.continue();
                    } else {
                        deferred.resolve(result);
                    }
                };
                request.onerror = (event) => deferred.reject(event.target.error);
                return deferred.promise;
            });
        }

        // this.updateCarInAllStores = function (updatedCar) {
        //     return openDb().then(() => {
        //         const deferred = $q.defer();
        //         const transaction = db.transaction(["cars", "bookings", "bids"], "readwrite");
        //         const carsStore = transaction.objectStore("cars");
        //         carsStore.put(updatedCar);
        //         const bookingsStore = transaction.objectStore("bookings");
        //         const bookingsRequest = bookingsStore.openCursor();
        //         bookingsRequest.onsuccess = (event) => {
        //             const cursor = event.target.result;
        //             if (cursor) {
        //                 const booking = cursor.value;
        //                 if (booking.bid?.car?.carId === updatedCar.carId) {
        //                     booking.bid.car = updatedCar;
        //                     cursor.update(booking);
        //                 }
        //                 cursor.continue();
        //             }
        //         };
        //         const bidsStore = transaction.objectStore("bids");
        //         const bidsRequest = bidsStore.openCursor();
        //         bidsRequest.onsuccess = (event) => {
        //             const cursor = event.target.result;
        //             if (cursor) {
        //                 const bid = cursor.value;
        //                 if (bid.car?.carId === updatedCar.carId) {
        //                     bid.car = updatedCar;
        //                     cursor.update(bid);
        //                 }
        //                 cursor.continue();
        //             }
        //         };

        //         transaction.oncomplete = () => deferred.resolve(true);
        //         transaction.onerror = (event) => deferred.reject(event.target.error);

        //         return deferred.promise;
        //     });
        // }
})