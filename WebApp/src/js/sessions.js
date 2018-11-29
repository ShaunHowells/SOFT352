function Sessions(user) {
    this.availableSessions = null;
    this.currentUserSessions = [];
    this.user = user;
    this.availableSessionWebSocket = null;
    this.startRetrievingAvailableSessions = function (callback) {
        //TODO: Sets up websocket to get list of available sessions
        this.availableSessionWebSocket = new WebSocket("ws://localhost:9000");

        this.availableSessionWebSocket.onmessage = function (message) {
            var messageData = JSON.parse(message.data);
            if (messageData.success) {
                callback(messageData.result);
            } else {
                console.error(messageData.message);
            }
        };
    };
    this.stopRetrievingAvailableSessions = function () {
        //TODO: Destroy web socked that gets list of avaailable sessions
    };
    this.retrieveAvailableSessions = function () {
        //TODO: Query sever to get available sessions once
        $.post({
            url: "http://localhost:9000/sessions/getallsessions",
            async: false,
        }, function (err, data) {
            this.currentUserSessions = data;
        });
        return this.currentUserSessions;
    };
    this.retrieveCurrentUserSessions = function () {
        //TODO: Query Server to get current user sessions once
        $.post({
            url: "http://localhost:9000/sessions/getusersessions",
            async: false,
            data: {
                userId: this.user.id
            }
        }, function (err, data) {
            this.currentUserSessions = data;
        });
        return this.currentUserSessions;
    };
    this.getAvailableSessions = function () {
        return this.availableSessions;
    };
    this.getCurrentUserSessions = function () {
        return this.currentUserSessions;
    };
}

var sessions = new Sessions();

MainApp.getInstance().controller("availableSessionsCtrl", function ($scope) {
    sessions.startRetrievingAvailableSessions(function (data) {
        $scope.$apply(function () {
            console.log(data);
            $scope.availableSessions = data;
        });
    });
    // $scope.availableSessions = [{
    //         owner: 'Shaun',
    //         name: 'My Test Session',
    //         id: 1
    //     },
    //     {
    //         owner: 'John',
    //         name: "I'm over here!",
    //         id: 2
    //     }, {
    //         owner: 'Shaun',
    //         name: 'My Test Session',
    //         id: 1
    //     },
    //     {
    //         owner: 'John',
    //         name: "I'm over here!",
    //         id: 2
    //     }
    // ];
}).controller("mySessionsCtrl", function ($scope) {
    $scope.mySessions = [{
            owner: 'Shaun',
            name: 'My Active Session 1',
            id: 1
        },
        {
            owner: 'John',
            name: "My Active Session 2",
            id: 2
        }
    ];
});