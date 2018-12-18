/**
 * availableSessionsCtrl - Controller for handling 'Available Sessions'
 */
AngularMainApp.controller("availableSessionsCtrl", function($scope) {
    $scope.availableSessions = [];
    //Set $scope.availableSessions and update display
    $scope.setAvailableSessions = function(data) {
        $scope.availableSessions = data;
        $scope.$applyAsync();
    };
    //Set $scope.setAvailableSessions as callback in CollabBookReader.getSessions() - Called when availableSession list is updated
    CollabBookReader.getSessions().getAvailableSessionsObserver().subscribe($scope.setAvailableSessions);

    //Display session details popup with given a given sessions details
    $scope.showSessionDetails = function(session) {
        $scope.displaySession = session;
        $scope.$applyAsync();
        if (CollabBookReader.getSessions().getCurrentUserSession()) {
            angular.element("#availableSessionDetailsModalJoinSession").prop("disabled", true);
            angular.element("#canJoinSession").html("<b>You cannot join another session while you are already in one!</b>");
            angular.element("#joinSessionUsername").hide();
        } else {
            angular.element("#availableSessionDetailsModalJoinSession").prop("disabled", false);
            angular.element("#canJoinSession").html("Do you want to join this session?");
            angular.element("#joinSessionUsername").show();
            angular.element("#joinSessionUsername").val("");
        }
        $("#availableSessionDetailsModal").modal();
    };

    //Called from availableSessionDetailsModalJoinSession button - Join a session
    $scope.joinSession = function(session) {
        var sessionUsername = angular.element("#joinSessionUsername").val();

        //Check that all values have been supplied
        if (!sessionUsername) {
            alert("Please enter your username for this session");
        } else {
            CollabBookReader.getSessions().joinSession(sessionUsername, session._id, function() { //Can take data
                //Hide modal popup and select 'My Session' tab
                $("#availableSessionDetailsModalClose").click();
                angular.element("#currentUserSessionTabHeading").click();

                //Hide displayed details
                $("#currentUserSessionCreate").hide();
                $("#currentUserSessionDetails").show();
            });
        };
    }
});

/**
 * availableSessionsCtrl - Controller for handling 'My Session'/Current User Session
 */
AngularMainApp.controller("currentUserSessionCtrl", function($scope) {
    $scope.currentUserSession = null;
    //Set $scope.currentUserSession and update display ($applyAsync)
    $scope.setCurrentUserSession = function(data) {
        $scope.currentUserSession = data;
        //If data is populated then we have a session
        //Hide 'Create a new session' button, and show currentUserSession details
        // Otherwise we don't have a session, so show the 'Create a new session' button and hide currentUserSession details
        if (data) {
            angular.element("#currentUserSessionCreate").hide();
            angular.element("#currentUserSessionDetails").show();
        } else {
            angular.element("#currentUserSessionDetails").hide();
            angular.element("#currentUserSessionCreate").show();
        }
        $scope.$applyAsync();
    };
    //Set $scope.setCurrentUserSession as callback in CollabBookReader.getSessions() - Called when currentUserSession is updated
    CollabBookReader.getSessions().getCurrentUserSessionObserver().subscribe($scope.setCurrentUserSession);

    //Called from createNewSession - Display 'Create a new session' modal popup
    $scope.displayCreateNewSessionDetails = function() {
        //Reset values before displaying
        $("#createNewSessionModal").find("input[type=text], select").val("");
        $("#createNewSessionModal").modal();
    };

    //Called from createNewSessionModalJoinSession - Create a new session
    $scope.createNewSession = function() {
        var newSessionUsername = angular.element("#createNewSessionUsername").val();
        var newSessionName = angular.element("#createNewSessionName").val();
        var newSessionBook = angular.element("#createNewSessionBook").val();
        //Check that all values have been supplied
        if (!newSessionUsername) {
            alert("Please enter your username for your session");
        } else if (!newSessionName) {
            alert("Please enter a name for your session");
        } else if (!newSessionBook) {
            alert("Please select a book");
        } else {
            //Create a new session and update UI upon success
            CollabBookReader.getSessions().createNewSession(newSessionUsername, newSessionName, newSessionBook, function(data) {
                //Hide create new session modal
                $("#createNewSessionModalClose").click();
                //Show newly created session details
                angular.element("#currentUserSessionTabHeading").click();

                //Set $scope.currentUserSession as result
                $scope.setCurrentUserSession(data.result);
            });
        }
    };

    //Called by currentUserSessionDetailsLeaveSession - Leave current session
    $scope.leaveSession = function(session) {
        CollabBookReader.getSessions().leaveCurrentSession(function() { //Can take data
            $("#currentUserSessionDetailsModalClose").click();
            angular.element("#availableSessionsTabHeading").click();
        });
    };
});