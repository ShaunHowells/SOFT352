AngularMainApp.controller("chatMessagesCtrl", function($scope) {
    $scope.chatMessages = [];

    //Set chatMessages to update the display
    $scope.setChatMessages = function(data) {
        $scope.chatMessages = data;

        $scope.$apply();

        //Scroll to bottom of chat list
        angular.element("#chatMessages").scrollTop(angular.element("#chatMessages")[0].scrollHeight);
    };
    //Set $scope.setAvailableSessions as callback in CollabBookReader.getSessions() - Called when availableSession list is updated
    Chat.getChatMessageObserver().subscribe($scope.setChatMessages);

    //Send user input chat message and clear display
    $scope.sendChatMessage = function(message) {
        if (message) {
            if (Sessions.getCurrentUserSession()) {
                Chat.sendChatMessage(Sessions.getCurrentUserSession()._id, message);
            } else {
                alert("You aren't currently in a session");
            }
            $scope.messageToSend = "";
        }
    };

    $scope.chatMessageEnter = function(event) {
        if (event.charCode == 13) {
            $scope.sendChatMessage($scope.messageToSend);
        }
    };
});