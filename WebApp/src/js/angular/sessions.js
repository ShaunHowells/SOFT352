AngularMainApp.getInstance()
    .controller("availableSessionsCtrl", function ($scope) {
        //Set callback in sessions property of CollabBookReader in order to update available sessions list via angular
        CollabBookReader.getSessions().setAvailableSessionsCallback(function (data) {
            $scope.availableSessions = data;
            $scope.$applyAsync ();
        });
    })
    .controller("mySessionsCtrl", function ($scope) {
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