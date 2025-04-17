mainApp.service('uploadService', ['$http', '$q', function ($http, $q) {
    // const BASE_URL = 'http://127.0.0.1:8006/api/v1/upload'; // Upload API endpoint
    
    const BASE_URL = 'https://carental-12t8.onrender.com/api/v1/upload'; // Upload API endpoint


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

    /**
     * @function getAttachments
     * @description Get all attachments for a specific chat
     * @param {String} chatId - The ID of the chat to fetch attachments for
     * @returns {Promise} - Resolves with attachment data or rejects with an error
     */
    this.getAttachments = function(chatId) {
        return $http.get(`http://127.0.0.1:8006/api/v1/chat/attachments/${chatId}`)
            .then(response => {
                if (response.data && response.data.success) {
                    return {
                        success: true,
                        count: response.data.count,
                        data: response.data.data
                    };
                } else {
                    return $q.reject('Failed to fetch attachments');
                }
            })
            .catch(error => {
                console.error('UploadService :: Failed to fetch attachments:', error);
                return $q.reject(error);
            });
    };
}]);