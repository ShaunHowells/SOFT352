MainApp.getInstance().controller("availableSessionsCtrl", function ($scope) {
    $scope.availableSessions = [{
            owner: 'Shaun',
            name: 'My Test Session',
            id: 1
        },
        {
            owner: 'John',
            name: "I'm over here!",
            id: 2
        }, {
            owner: 'Shaun',
            name: 'My Test Session',
            id: 1
        },
        {
            owner: 'John',
            name: "I'm over here!",
            id: 2
        }
    ];
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


function Sessions(user) {
    this.availableSessions = null;
    this.currentUserSessions = [];
    this.user = user;
    this.startRetrievingAvailableSessions = function () {
        //TODO: Sets up websocket to get list of available sessions
    };
    this.stopRetrievingAvailableSessions = function () {
        //TODO: Destroy web socked that gets list of avaailable sessions
    };
    this.retrieveAvailableSessions = function () {
        //TODO: Query sever to get available sessions once
    };
    this.retrieveCurrentUserSessions = function () {
        //TODO: Query Server to get current user sessions once
    };
    this.getAvailableSessions = function () {
        //TODO: Return list of available sessions
    };
    this.getCurrentUserSessions = function () {
        //TODO: Return list of currentUserSessions
    };
}