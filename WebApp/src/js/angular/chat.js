AngularMainApp.controller("chatMessagesCtrl", function($scope) {
    $scope.chatMessages = [];

    //Set chatMessages to update the display
    $scope.setChatMessages = function(data) {
        $scope.chatMessages = data;

        $scope.$apply();

        //Scroll to bottom of chat list
        $('#chatMessages').scrollTop($('#chatMessages')[0].scrollHeight);
    };
    //Set $scope.setAvailableSessions as callback in CollabBookReader.getSessions() - Called when availableSession list is updated
    CollabBookReader.getChat().getChatMessageObserver().subscribe($scope.setChatMessages);

    //Send user input chat message and clear display
    $scope.sendChatMessage = function(message) {
        CollabBookReader.getChat().sendChatMessage(message);
        $scope.messageToSend = "";
    };

    $scope.chatMessageEnter = function(event) {
        if (event.charCode == 13) {
            $scope.sendChatMessage($scope.messageToSend);
        }
    }
});