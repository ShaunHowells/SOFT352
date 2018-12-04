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
        //Set callback in sessions property of CollabBookReader in order to update current user sessions list via angular
        $scope.setCurrentUserSessions = function (data) {
            $scope.currentUserSessions = data;
            $scope.$applyAsync();
        }
        CollabBookReader.getSessions().setCurrentUserSessionsCallback(angular.element($("#currentUserSessions")).scope().setCurrentUserSessions);

        $scope.displayCreateNewSessionDetails = function () {
            //Reset values before displaying
            $("#createNewSessionModal").find('input[type=text], select').val("");
            $("#createNewSessionModal").modal();
        };
        $scope.showSessionDetails = function (session) {
            console.log(session);
            $scope.selectedSession = session;
            $("#currentUserSessionDetailsModal").modal()
        };
        $scope.createNewSession = function () {
            var newSessionName = angular.element("#createNewSessionName").val();
            var newSessionBook = angular.element("#createNewSessionBook").val();
            if (!newSessionName) {
                alert("Please enter a name for your session");
            } else if (!newSessionBook) {
                alert("Please select a book");
            } else {
                CollabBookReader.getSessions().createNewSession(newSessionName, newSessionBook, function (data) {
                    //Hide create new session modal
                    $("#createNewSessionModalClose").click();
                    angular.element("#currentUserSessionsTabHeading").click();
                });
            }
        };
        $scope.leaveSession = function(session){
            CollabBookReader.getSessions().leaveSession(session._id, function(data){
                $("#currentUserSessionDetailsModalClose").click();
            });
        }
    });