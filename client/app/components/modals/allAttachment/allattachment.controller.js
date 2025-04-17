mainApp.controller('AllAttachmentModalController', [
    '$scope', '$uibModalInstance', 'chatId', 'uploadService',
    function ($scope, $uibModalInstance, chatId, uploadService) {
        let vm = this;
        
        // Variables
        vm.loading = false;
        vm.attachments = [];
        vm.selectedAttachment = null;
        vm.isZoomed = false;
        vm.chatId = chatId;
        
        // Initialize
        vm.init = function() {
            vm.loading = true;
            
            uploadService.getAttachments(vm.chatId)
                .then(function(response) {
                    // Filter only image attachments
                    vm.attachments = response.data.filter(function(attachment) {
                        return attachment.type.startsWith('image/');
                    });
                    
                    if (vm.attachments.length > 0) {
                        vm.selectedAttachment = vm.attachments[0];
                    }
                })
                .catch(function(error) {
                    console.error('Error loading attachments:', error);
                })
                .finally(function() {
                    vm.loading = false;
                });
        };
        
        // Functions
        vm.closeModal = function() {
            $uibModalInstance.dismiss('cancel');
        };
        
        vm.selectAttachment = function(attachment) {
            vm.selectedAttachment = attachment;
            vm.isZoomed = false;
        };
        
        vm.toggleZoom = function() {
            vm.isZoomed = !vm.isZoomed;
        };
        
        // Initialize the controller
        vm.init();
    }
]);