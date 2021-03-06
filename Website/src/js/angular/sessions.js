/**
 * availableSessionsCtrl - Controller for handling 'Available Sessions'
 */
AngularMainApp.controller("availableSessionsCtrl", function($scope) {
    $scope.availableSessions = [];
    //Set $scope.availableSessions and update display
    $scope.setAvailableSessions = function(data) {
        $scope.availableSessions = data;
        //If we're currently displaying the details of a session, check if it's still available
        checkDisplayedSessionDetails();
        $scope.$applyAsync();
    };
    //Set $scope.setAvailableSessions as callback in CollabBookReader.getSessions() - Called when availableSession list is updated
    Sessions.getAvailableSessionsObserver().subscribe($scope.setAvailableSessions);

    //Check if we're currently displaying available session details
    //If that session is no longer available then close the popup and alert the user
    function checkDisplayedSessionDetails() {
        if ($scope.displaySession) {
            var allAvailableSessions = Sessions.getAvailableSessions();
            var found = false;
            for (var i = 0; i < allAvailableSessions.length; i++) {
                if ($scope.displaySession._id == allAvailableSessions[i]._id) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                hideSessionDetails();
                displaySessionNoLongerAvailableAlert();
            }
        }
    }

    //Hide the availableSessionDetailsModal
    function hideSessionDetails() {
        angular.element("#availableSessionDetailsModalClose").click();
    }
    //When availableSessionDetailsModal is hidden
    //Clear $scope.displaySession
    angular.element("#availableSessionDetailsModal").on("hidden.bs.modal", function() {
        $scope.displaySession = null;
    });
    //When the close button on the sessionNoLongerAvaiable alert is clicked, manually hide the alert
    //In Bootstrap the default close action ony allows the alert to display once
    angular.element("#sessionNoLongerAvailableClose").click(function() {
        angular.element("#sessionNoLongerAvailableAlert").hide();
    });
    var sessionNoLongerAvailableTimeout;

    function displaySessionNoLongerAvailableAlert() {
        //If timeout exists, then clear it
        if (sessionNoLongerAvailableTimeout) {
            clearTimeout(sessionNoLongerAvailableTimeout);
        }
        //Show alert and cancel all current animations
        var sessionNoLongerAvailableAlert = angular.element("#sessionNoLongerAvailableAlert");
        sessionNoLongerAvailableAlert.stop();
        sessionNoLongerAvailableAlert.removeAttr("style");
        sessionNoLongerAvailableAlert.show();
        //After 3 sconds hide the alert
        sessionNoLongerAvailableTimeout = window.setTimeout(function() {
            sessionNoLongerAvailableAlert.hide({
                duration: 1000
            });
        }, 3000);
    }

    //Display session details popup with given a given sessions details
    $scope.showSessionDetails = function(session) {
        $scope.displaySession = session;
        $scope.$applyAsync();
        if (Sessions.getCurrentUserSession()) {
            angular.element("#availableSessionDetailsModalJoinSession").prop("disabled", true);
            angular.element("#canJoinSession").html("<b>You cannot join another session while you are already in one!</b>");
        } else {
            angular.element("#availableSessionDetailsModalJoinSession").prop("disabled", false);
            angular.element("#canJoinSession").html("Do you want to join this session?");
        }
        angular.element("#availableSessionDetailsModal").modal();
    };

    //Called from availableSessionDetailsModalJoinSession button - Join a session
    $scope.joinSession = function(session) {
        Sessions.joinSession(session._id, CollabBookReader.getUsername(), function(data) {

            Users.setUsers(data.users);
            //Hide modal popup and select 'My Session' tab
            angular.element("#availableSessionDetailsModalClose").click();
            angular.element("#currentUserSessionTabHeading").click();

            //Hide displayed details
            angular.element("#currentUserSessionCreate").hide();
            angular.element("#currentUserSessionDetails").show();
        });
    };
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
            angular.element("#chatInputMessage").attr("disabled", false);
            angular.element("#createNewNote").attr("disabled", false);
        } else {
            angular.element("#currentUserSessionDetails").hide();
            angular.element("#currentUserSessionCreate").show();
            angular.element("#chatInputMessage").attr("disabled", true);
            angular.element("#createNewNote").attr("disabled", true);
        }
        $scope.$applyAsync();
    };
    //Set $scope.setCurrentUserSession as callback in CollabBookReader.getSessions() - Called when currentUserSession is updated
    Sessions.getCurrentUserSessionObserver().subscribe($scope.setCurrentUserSession);

    //Called from createNewSession - Display 'Create a new session' modal popup
    $scope.displayCreateNewSessionDetails = function() {
        //Reset values before displaying
        angular.element("#createNewSessionModal").find("input[type=text], select").val("");
        angular.element("#createNewSessionModal").modal();
    };

    //Called from createNewSessionModalJoinSession - Create a new session
    $scope.createNewSession = function() {
        if (validCreateNewSessionForm()) {
            var newSessionName = angular.element("#createNewSessionName").val();
            var newSessionBook = angular.element("#createNewSessionBook").val();
            //Create a new session and update UI upon success
            Sessions.createNewSession(newSessionName, newSessionBook, CollabBookReader.getUsername(), function(data) {
                //Hide create new session modal
                angular.element("#createNewSessionModalClose").click();
                //Show newly created session details
                angular.element("#currentUserSessionTabHeading").click();

                //Set $scope.currentUserSession as result
                $scope.setCurrentUserSession(data.result);
            });
        }
    };

    function validCreateNewSessionForm() {
        var form = document.getElementById("createNewSessionForm");
        var valid = form.checkValidity();
        form.classList.add("was-validated");

        return valid;
    }

    angular.element("#createNewSessionModal").on("hidden.bs.modal", function() {
        document.getElementById("createNewSessionForm").classList.remove("was-validated");
    });

    //Called by currentUserSessionDetailsLeaveSession - Leave current session
    $scope.leaveSession = function() {
        Sessions.leaveCurrentSession(function() { //Can take data
            angular.element("#currentUserSessionDetailsModalClose").click();
            angular.element("#availableSessionsTabHeading").click();
        });
    };

    $scope.currentUserSessionUsers = [];
    //Set $scope.bookList and update display ($applyAsync)
    $scope.setCurrentUserSessionUsers = function(data) {
        $scope.currentUserSessionUsers = data;
        $scope.$applyAsync();
    };
    //Set $scope.setBookList as callback in Books. - Called when bookList is updated
    Users.getCurrentSessionUsersObserver().subscribe($scope.setCurrentUserSessionUsers);

});