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
        } else {
            angular.element("#availableSessionDetailsModalJoinSession").prop("disabled", false);
            angular.element("#canJoinSession").html("Do you want to join this session?");
        }
        angular.element("#availableSessionDetailsModal").modal();
    };

    //Called from availableSessionDetailsModalJoinSession button - Join a session
    $scope.joinSession = function(session) {
        CollabBookReader.getSessions().joinSession(session._id, function(data) {

            CollabBookReader.getUsers().setUsers(data.users);
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
    CollabBookReader.getSessions().getCurrentUserSessionObserver().subscribe($scope.setCurrentUserSession);

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
            CollabBookReader.getSessions().createNewSession(newSessionName, newSessionBook, function(data) {
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
        document.getElementById("createNewSessionForm").classList.remove("was-validated");;
    });

    //Called by currentUserSessionDetailsLeaveSession - Leave current session
    $scope.leaveSession = function() {
        CollabBookReader.getSessions().leaveCurrentSession(function() { //Can take data
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
    //Set $scope.setBookList as callback in CollabBookReader.getBooks() - Called when bookList is updated
    CollabBookReader.getUsers().getCurrentSessionUsersObserver().subscribe($scope.setCurrentUserSessionUsers);

});