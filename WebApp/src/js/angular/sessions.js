AngularMainApp.getInstance()
    .controller("availableSessionsCtrl", function ($scope) {
        $scope.availableSessions = [];
        //Set callback in sessions property of CollabBookReader in order to update available sessions list via angular
        $scope.setAvailableSessions = function (data) {
            $scope.availableSessions = data;
            $scope.$applyAsync();
        }
        CollabBookReader.getSessions().setAvailableSessionsCallback(angular.element($("#availableSessions")).scope().setAvailableSessions);


        $scope.showSessionDetails = function (session) {
            console.log(session);
            $scope.selectedSession = session;
            $("#availableSessionDetailsModal").modal()
        };

        $scope.joinSession = function (session) {
            CollabBookReader.getSessions().joinSession(session._id, function (data) {
                //Hide displayed details
                $("#availableSessionDetailsModalClose").click();
                angular.element("#currentUserSessionsTabHeading").click();
            });

        }
    })
    .controller("currentUserSessionsCtrl", function ($scope) {
        $scope.currentUserSessions = [];
        //Set callback in sessions property of CollabBookReader in order to update available sessions list via angular
        $scope.setCurrentUserSessions = function (data) {
            $scope.currentUserSessions = data;
            $scope.$applyAsync();
        }
        CollabBookReader.getSessions().setCurrentUserSessionsCallback(angular.element($("#currentUserSessions")).scope().setCurrentUserSessions);
    });