mainApp.service('uploadService', ['$http', '$q', function ($http, $q) {
    const BASE_URL = 'http://127.0.0.1:8006/api/v1/upload'; // Upload API endpoint

    /**
     * @function uploadFile
     * @description Upload a file to the server and return the file URL.
     * @param {File} file - The file to be uploaded.
     * @returns {Promise} - Resolves with the file URL or rejects with an error.
     */
    this.uploadFile = function (file, chatId, fromUser, toUser) {
        const deferred = $q.defer();



        const formData = new FormData();
        formData.append('file', file);
        formData.append('chatId', chatId);
        formData.append('fromUser', JSON.stringify(fromUser));
        formData.append('toUser', JSON.stringify(toUser));

        console.log(formData);

        return $http.post(BASE_URL, formData, {
            headers: { 'Content-Type': undefined }, // Let the browser set the Content-Type
        })
            .then(response => {

                console.log('File uploaded successfully!');

                if (response.data && response.data.fileUrl) {
                    return response.data; // Return the file URL

                } else {
                    return deferred.reject('File upload failed: No file URL returned.');
                }
            })
            .catch(error => {
                console.error('UploadService :: File upload failed:', error);
                return deferred.reject(error);
            });
    };
}]);