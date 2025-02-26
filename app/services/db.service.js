mainApp.service('dbService', function ($q) {
        const dbName = "angularCarRental";
        const dbVersion = 1;
        let db = null;

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

            request.onerror = function (event) {
                deferred.reject(event.target.error);
            };

            request.onsuccess = function (event) {
                db = event.target.result;
                deferred.resolve(db);
            };

            request.onupgradeneeded = function (event) {
                db = event.target.result;
                Object.keys(schema).forEach(storeName => {
                    if (!db.objectStoreNames.contains(storeName)) {
                        const storeConfig = schema[storeName];
                        const store = db.createObjectStore(storeName, storeConfig.store);
                        if (storeConfig.indexes) {
                            storeConfig.indexes.forEach(index => {
                                store.createIndex(index.name, index.keyPath, index.options);
                            });
                        }
                    }
                });
            };

            return deferred.promise;
        }

        function getObjectStore(storeName, mode) {
            const transaction = db.transaction([storeName], mode);
            return transaction.objectStore(storeName);
        }

        this.init = function () {
            return openDb();
        },

        this.addItem = function (storeName, item) {
            return openDb().then(() => {
                const deferred = $q.defer();
                const store = getObjectStore(storeName, "readwrite");
                const request = store.add(item);
                request.onsuccess = () => deferred.resolve(item);
                request.onerror = (event) => deferred.reject(event.target.error);
                return deferred.promise;
            });
        },

        this.updateItem = function (storeName, item) {
            return openDb().then(() => {
                const deferred = $q.defer();
                const store = getObjectStore(storeName, "readwrite");
                const request = store.put(item);
                request.onsuccess = () => deferred.resolve(item);
                request.onerror = (event) => deferred.reject(event.target.error);
                return deferred.promise;
            });
        },

        this.deleteItem = function (storeName, key) {
            return openDb().then(() => {
                const deferred = $q.defer();
                const store = getObjectStore(storeName, "readwrite");
                const request = store.delete(key);
                request.onsuccess = () => deferred.resolve(true);
                request.onerror = (event) => deferred.reject(event.target.error);
                return deferred.promise;
            });
        },

        this.getItemByKey = function (storeName, key) {
            return openDb().then(() => {
                const deferred = $q.defer();
                const store = getObjectStore(storeName, "readonly");
                const request = store.get(key);
                request.onsuccess = () => deferred.resolve(request.result);
                request.onerror = (event) => deferred.reject(event.target.error);
                return deferred.promise;
            });
        },

        this.getItemByIndex = function (storeName, indexName, key) {
            return openDb().then(() => {
                const deferred = $q.defer();
                const store = getObjectStore(storeName, "readonly");
                const index = store.index(indexName);
                const request = index.get(key);
                request.onsuccess = () => deferred.resolve(request.result);
                request.onerror = (event) => deferred.reject(event.target.error);
                return deferred.promise;
            });
        },

        this.getAllItemsByIndex = function (storeName, indexName, key) {
            return openDb().then(() => {
                const deferred = $q.defer();
                const store = getObjectStore(storeName, "readonly");
                const index = store.index(indexName);
                const request = index.getAll(key);
                request.onsuccess = () => deferred.resolve(request.result || []);
                request.onerror = (event) => deferred.reject(event.target.error);
                return deferred.promise;
            });
        },

        this.getAllItems = function (storeName, limit = 1000) {
            return openDb()
                .then(() => {
                    const deferred = $q.defer();
                    try {
                        const store = getObjectStore(storeName, "readonly");
                        if (store.getAll) {
                            const request = store.getAll();
                            request.onsuccess = () => {
                                const items = request.result || [];
                                deferred.resolve(items.slice(0, limit));
                            };
                            request.onerror = (event) => deferred.reject(event.target.error);
                        } else {
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
                        }
                    } catch (error) {
                        deferred.reject(error);
                    }
                    return deferred.promise;
                })
                .catch(error => {
                    console.error('Error in getAllItems:', error);
                    return $q.reject(error);
                });
        },

        this.getItemsWithPagination = function (storeName, page = 1, itemsPerPage = 5) {
            return openDb().then(() => {
                const deferred = $q.defer();
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
                        else deferred.resolve(items);
                    } else {
                        deferred.resolve(items);
                    }
                };
                request.onerror = (event) => deferred.reject(event.target.error);
                return deferred.promise;
            });
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
                const cutoffDate = new Date();
                cutoffDate.setDate(cutoffDate.getDate() - days);

                const request = index.openCursor();
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

        this.updateCarInAllStores = function (updatedCar) {
            return openDb().then(() => {
                const deferred = $q.defer();
                const transaction = db.transaction(["cars", "bookings", "bids"], "readwrite");

                const carsStore = transaction.objectStore("cars");
                carsStore.put(updatedCar);

                const bookingsStore = transaction.objectStore("bookings");
                const bookingsRequest = bookingsStore.openCursor();
                bookingsRequest.onsuccess = (event) => {
                    const cursor = event.target.result;
                    if (cursor) {
                        const booking = cursor.value;
                        if (booking.bid?.car?.carId === updatedCar.carId) {
                            booking.bid.car = updatedCar;
                            cursor.update(booking);
                        }
                        cursor.continue();
                    }
                };

                const bidsStore = transaction.objectStore("bids");
                const bidsRequest = bidsStore.openCursor();
                bidsRequest.onsuccess = (event) => {
                    const cursor = event.target.result;
                    if (cursor) {
                        const bid = cursor.value;
                        if (bid.car?.carId === updatedCar.carId) {
                            bid.car = updatedCar;
                            cursor.update(bid);
                        }
                        cursor.continue();
                    }
                };

                transaction.oncomplete = () => deferred.resolve(true);
                transaction.onerror = (event) => deferred.reject(event.target.error);

                return deferred.promise;
            });
        }

})