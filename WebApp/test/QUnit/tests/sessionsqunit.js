//Variables used by multiple tests
var testSessionName = "QUnit Test Session";
var testSessionBook = "shauntestbook";
var sampleAvailableSessionList = [{
        "currentBook": {
            "pageNum": 0,
            "notes": []
        },
        "_id": "5c0558e8ea7d8f4414abb2e6",
        "name": "Shaun's Test Session",
        "owner": "ShaunH",
        "users": [{
            "_id": "5c0558e8ea7d8f4414abb2e7",
            "userId": "ShaunH"
        }],
        "__v": 0
    },
    {
        "currentBook": {
            "pageNum": 0,
            "notes": []
        },
        "_id": "5c0558f1ea7d8f4414abb2e8",
        "name": "Yet Another Session",
        "owner": "John Smith",
        "users": [{
            "_id": "5c0558f1ea7d8f4414abb2e9",
            "userId": "John Smith"
        }],
        "__v": 0
    }
];
var sampleSession = {
    "currentBook": {
        "pageNum": 0,
        "notes": []
    },
    "_id": "5c055a6dea7d8f4414abb2ea",
    "name": "Shaun's Sample Session",
    "owner": "Frodo Baggins",
    "users": [{
        "_id": "5c055a6dea7d8f4414abb2eb",
        "userId": "Frodo Baggins"
    }],
    "__v": 0
};
var sampleCurrentUserSessionList = [{
    "currentBook": {
        "pageNum": 0,
        "notes": []
    },
    "_id": "5c0560f57023de4a343ea0bc",
    "name": "A fun session",
    "owner": "A clown",
    "users": [{
        "_id": "5c0560f57023de4a343ea0bd",
        "userId": "A clown"
    }],
    "__v": 0
}];

// QUnit.module('Sessions', { // define the module - qualify with QUnit namespace to avoid conflict with Angular
//     previousAvailableSessionList: null,

//     before: function () {
//         CollabBookReader.stopWebSocketConnection();
//     },
//     after: function () {
//         CollabBookReader.startWebSocketConnection();
//     }
//     // beforeEach: function () {
//     //     previousAvailableSessionList = CollabBookReader.getSessions().getAvailableSessions();
//     // },
//     // afterEach: function () {
//     //     CollabBookReader.getSessions().setAvailableSessions(previousAvailableSessionList);
//     // }
// });

//TODO: See if I can remove calls to $apply. Currently using them as I'm using $applyAsync() in the actual code

QUnit.test("Sessions #1 - Show Available Sessions List", function (assert) {
    //Get currently active element to set original element back to active after test
    var currentlyActiveElement = angular.element("#sessionTabList").find("li .active");
    //Click availableSessionsTabHeading
    angular.element("#availableSessionsTabHeading").click();

    assert.ok(angular.element("#availableSessions").is(":visible"), "Available session list should be visible");

    currentlyActiveElement.click();
});

QUnit.test("Sessions #2 - Show My Sessions List", function (assert) {
    //Get currently active element to set original element back to active after test
    var currentlyActiveElement = angular.element("#sessionTabList").find("li .active");
    //Click currentUserSessionsTabHeading
    angular.element("#currentUserSessionsTabHeading").click();

    assert.ok(angular.element("#currentUserSessions").is(":visible"), "Available session list should be visible");

    currentlyActiveElement.click();
});

QUnit.test("Sessions #3 - Add sessions to available session list", function (assert) {
    //Store previous values
    var previousAvailableSessionList = CollabBookReader.getSessions().getAvailableSessions();

    var availableSessionsCount;
    //Get required angular scope
    var availableSessionsCtrlScope = angular.element($("#availableSessions")).scope();

    //Set availableSessions to an empty array (no sessions available)
    CollabBookReader.getSessions().setAvailableSessions([]);
    //Manually call .$apply() as it normally uses $applyAsync()
    availableSessionsCtrlScope.$apply();

    //Check that angular $scope is correctly updated 
    availableSessionsCount = availableSessionsCtrlScope.availableSessions.length;
    assert.equal(availableSessionsCount, 0, "0 sessions should be available in $scope");
    assert.equal(angular.element("#availableSessions").children("a").length, 0, "0 sessions should be displayed")

    //Update availableSessions to our sample session list
    CollabBookReader.getSessions().setAvailableSessions(sampleAvailableSessionList);
    //Manually call .$apply() as it normally uses $applyAsync()
    availableSessionsCtrlScope.$apply();

    //Check that the angular $scope is correctly updated
    availableSessionsCount = availableSessionsCtrlScope.availableSessions.length;
    assert.equal(availableSessionsCount, 2, "2 sessions should be available in $scope");
    assert.equal(angular.element("#availableSessions").children("a").length, 2, "2 sessions should be displayed")

    //Reset session list to previous value
    CollabBookReader.getSessions().setAvailableSessions(previousAvailableSessionList);
});

QUnit.test("Sessions #4 - Add new session to displayed available session list", function (assert) {
    //Store previous values
    var previousAvailableSessionList = CollabBookReader.getSessions().getAvailableSessions();

    var availableSessionsCount;
    //Get required angular scope
    var availableSessionsCtrlScope = angular.element($("#availableSessions")).scope();

    //Set availableSessions to our sample session list
    CollabBookReader.getSessions().setAvailableSessions(sampleAvailableSessionList);
    //Manually call .$apply() as it normally uses $applyAsync()
    availableSessionsCtrlScope.$apply();

    //Check that the angular $scope is correctly updated
    availableSessionsCount = availableSessionsCtrlScope.availableSessions.length;
    assert.equal(availableSessionsCount, 2, "2 sessions should be available");
    assert.equal(angular.element("#availableSessions").children("a").length, 2, "2 sessions should be displayed")

    //Add new session to session list
    CollabBookReader.getSessions().pushAvailableSession(sampleSession);
    //Check that the angular $scope is correctly updated
    availableSessionsCount = availableSessionsCtrlScope.availableSessions.length;
    assert.equal(availableSessionsCount, 3, "3 sessions should be available");

    //Reset session list to previous value
    CollabBookReader.getSessions().setAvailableSessions(previousAvailableSessionList);
});

QUnit.test("Sessions #5 - View session details", function (assert) {
    //Store previous values
    var previousAvailableSessionList = CollabBookReader.getSessions().getAvailableSessions();
    //Get currently active tab heading to set original heading back to active after test
    var currentlyActiveTabHeading = angular.element("#sessionTabList").find("li .active");

    //Click availableSessionsTabHeading to display available sessions so we can click the sessions
    angular.element("#availableSessionsTabHeading").click();

    var availableSessionsCount;
    //Get required angular scope
    var availableSessionsCtrlScope = angular.element($("#availableSessions")).scope();

    //Set availableSessions to our sample session list
    CollabBookReader.getSessions().setAvailableSessions(sampleAvailableSessionList);
    //Manually call .$apply() as it normally uses $applyAsync
    availableSessionsCtrlScope.$apply();

    //Check that the angular $scope is correctly updated
    availableSessionsCount = availableSessionsCtrlScope.availableSessions.length;
    assert.equal(availableSessionsCount, 2, "2 sessions should be available");

    //Select the first session in the list to display the details
    angular.element("#availableSessionId" + sampleAvailableSessionList[0]._id).click();

    assert.ok(angular.element("#availableSessionDetailsModal").is(":visible"), "Details are currently being displayed");

    //Get selectedSession variable used in session details
    var selectedSession = angular.element("#availableSessionDetailsModal").scope().selectedSession;
    //Check values of selected session are the same as the session that was clicked
    assert.equal(selectedSession._id, sampleAvailableSessionList[0]._id, "Session Details has correct _id");
    assert.equal(selectedSession.name, sampleAvailableSessionList[0].name, "Session Details has correct name");
    assert.equal(selectedSession.owner, sampleAvailableSessionList[0].owner, "Session Details has correct owner");

    //Hide displayed details
    $("#availableSessionDetailsModalClose").click();
    //Reset session list to previous value
    CollabBookReader.getSessions().setAvailableSessions(previousAvailableSessionList);
    currentlyActiveTabHeading.click();
});

QUnit.test("Sessions #6 - Add sessions to current user sessions list", function (assert) {
    //Store previous values
    var previousCurrentUserSessionList = CollabBookReader.getSessions().getCurrentUserSessions();

    var currentUserSessionsCount;
    //Get required angular scope
    var currentUserSessionsCtrlScope = angular.element($("#currentUserSessions")).scope();

    CollabBookReader.getSessions().setCurrentUserSessions([]);

    //Check that the angular $scope is correctly updated
    currentUserSessionsCount = currentUserSessionsCtrlScope.currentUserSessions.length;
    assert.equal(currentUserSessionsCount, 0, "0 sessions should be in the current user Sessions list");

    //As I'm not testing the server functionality here, I'll use sample data to update currentUserSessions can check the reponse is correct
    CollabBookReader.getSessions().setCurrentUserSessions(sampleCurrentUserSessionList);

    //Check that the angular $scope is correctly updated
    currentUserSessionsCount = currentUserSessionsCtrlScope.currentUserSessions.length;
    assert.equal(currentUserSessionsCount, 1, "1 session should be in the session list");

    //Reset session list to previous value
    CollabBookReader.getSessions().setCurrentUserSessions(previousCurrentUserSessionList);
});

QUnit.test("Sessions #7 - Add new session to current user sessions list", function (assert) {
    //Store previous values
    var previousCurrentUserSessionsList = CollabBookReader.getSessions().getCurrentUserSessions();

    var currentUserSessionsCount;
    //Get required angular scope
    var currentUserSessionsCtrlScope = angular.element($("#currentUserSessions")).scope();

    CollabBookReader.getSessions().setCurrentUserSessions([]);

    //Check that the angular $scope is correctly updated
    currentUserSessionsCount = currentUserSessionsCtrlScope.currentUserSessions.length;
    assert.equal(currentUserSessionsCount, 0, "0 sessions should be in current user sessions list");

    //As I'm not testing the server functionality here, I'll use sample data to update currentUserSessions can check that the UI updates correctly
    CollabBookReader.getSessions().pushCurrentUserSession(sampleSession);

    //Check that the angular $scope is correctly updated
    currentUserSessionsCount = currentUserSessionsCtrlScope.currentUserSessions.length;
    assert.equal(currentUserSessionsCount, 1, "1 session should be in current user sessions list");

    //Reset session list to previous value
    CollabBookReader.getSessions().setCurrentUserSessions(previousCurrentUserSessionsList);
});

QUnit.test("Sessions #8 - Display details of session in MySessions list", function (assert) {
    //Store previous values
    var previousCurrentUserSessionsList = CollabBookReader.getSessions().getCurrentUserSessions();
    var currentlyActiveTabHeading = angular.element("#sessionTabList").find("li .active");

    var currentUserSessionsCount;
    //Get required angular scope
    var currentUserSessionsCtrlScope = angular.element($("#currentUserSessions")).scope();
    //Set currentUserSessions so we have a session to click
    CollabBookReader.getSessions().setCurrentUserSessions(sampleCurrentUserSessionList);
    //Manually call .$apply() as it normally uses $applyAsync()
    currentUserSessionsCtrlScope.$apply();

    //Click currentUserSessionsTabHeading
    angular.element("#currentUserSessionsTabHeading").click();

    //Check that the angular $scope is correctly updated
    currentUserSessionsCount = currentUserSessionsCtrlScope.currentUserSessions.length;
    assert.equal(currentUserSessionsCount, 1, "1 session should be in current user sessions list");

    //Select the first session in the list to display the details
    angular.element("#currentUserSessionId" + sampleCurrentUserSessionList[0]._id).click();
    //Check that sessions detail modal is showing
    assert.ok(angular.element("#currentUserSessionDetailsModal").is(":visible"), "Details are currently being displayed");

    //Get selectedSession variable used in session details
    var selectedSession = angular.element("#currentUserSessionDetailsModal").scope().selectedSession;
    //Check values of selected session are the same as the session that was clicked
    assert.equal(selectedSession._id, sampleCurrentUserSessionList[0]._id, "Session Details has correct _id");
    assert.equal(selectedSession.name, sampleCurrentUserSessionList[0].name, "Session Details has correct name");
    assert.equal(selectedSession.owner, sampleCurrentUserSessionList[0].owner, "Session Details has correct owner");

    //Hide displayed details
    $("#currentUserSessionDetailsModalClose").click();
    assert.ok(!angular.element("#currentUserSessionDetailsModal").is(":visible"), "Details should now be hidden");

    //Reset session list to previous value
    CollabBookReader.getSessions().setCurrentUserSessions(previousCurrentUserSessionsList);
    currentlyActiveTabHeading.click()
});

QUnit.test("Sessions #9 - Display 'Create new session' modal", function (assert) {
    var currentlyActiveTabHeading = angular.element("#sessionTabList").find("li .active");

    //Click currentUserSessionsTabHeading to display Create new session button
    angular.element("#currentUserSessionsTabHeading").click();

    angular.element("#createNewSession").click();
    assert.ok(angular.element("#createNewSessionModal").is(":visible"), "Create new session modal is currently being displayed");

    assert.equal(angular.element("#createNewSessionName").val(), "", "Session name should be empty");
    assert.equal(angular.element("#createNewSessionBook").val(), null, "Session book should be empty");

    //Set values in createNewSessionModal
    angular.element("#createNewSessionName").val("QUnit Test Session");

    //Close createNewSessionModal
    angular.element("#createNewSessionModalClose").click();
    assert.ok(!angular.element("#createNewSessionModal").is(":visible"), "Create new session modal should now be hidden");

    //Reopen createNewSessionModal to check that the values have been reset
    angular.element("#createNewSession").click();

    assert.equal(angular.element("#createNewSessionName").val(), "", "Session name should have been reset after re-opening the popup");
    
    //Close createNewSessionModal
    angular.element("#createNewSessionModalClose").click();
    currentlyActiveTabHeading.click();
});

QUnit.test("Sessions #10 - Update display when available session is no longer available", function (assert) {
    //Store previous values
    var currentlyActiveTabHeading = angular.element("#sessionTabList").find("li .active");
    var previousAvailableSessionList = CollabBookReader.getSessions().getAvailableSessions();

    angular.element("#availableSessionsTabHeading").click();

    var availableSessionsCount;
    //Get required angular scope
    var availableSessionsCtrlScope = angular.element($("#availableSessions")).scope();

    //As I'm not testing the server functionality here, I'll use sample data to update currentUserSessions can check the reponse is correct
    CollabBookReader.getSessions().setAvailableSessions(sampleAvailableSessionList);
    //Manually call .$apply() as it normally uses $applyAsync()
    availableSessionsCtrlScope.$apply();

    //Check that the angular $scope is correctly updated
    availableSessionsCount = availableSessionsCtrlScope.availableSessions.length;
    assert.equal(availableSessionsCount, 2, "2 session should be in the session list");
    assert.equal(angular.element("#availableSessions").children("a").length, 2, "2 sessions should be displayed")

    //Remove first session in currentUserSessions
    CollabBookReader.getSessions().removeAvailableSession(sampleAvailableSessionList[0]._id);
    //Manually call .$apply() as it normally uses $applyAsync()
    availableSessionsCtrlScope.$apply();

    //Check that the angular $scope is correctly updated
    availableSessionsCount = availableSessionsCtrlScope.availableSessions.length;
    assert.equal(availableSessionsCount, 1, "1 sessions should be in the session list");
    assert.equal(angular.element("#availableSessions").children("a").length, 1, "1 sessions should be displayed")

    //Reset session list to previous value
    CollabBookReader.getSessions().setAvailableSessions(previousAvailableSessionList);
    currentlyActiveTabHeading.click();
});

QUnit.test("Sessions #11 - Update display when leaving a session", function (assert) {
    //Store previous values
    var currentlyActiveTabHeading = angular.element("#sessionTabList").find("li .active");
    var previousCurrentUserSessionList = CollabBookReader.getSessions().getCurrentUserSessions();

    angular.element("#currentUserSessionsTabHeading").click();

    var currentUserSessionsCount;
    //Get required angular scope
    var currentUserSessionsCtrlScope = angular.element($("#currentUserSessions")).scope();

    //As I'm not testing the server functionality here, I'll use sample data to update currentUserSessions can check the reponse is correct
    CollabBookReader.getSessions().setCurrentUserSessions(sampleCurrentUserSessionList);
    //Manually call .$apply() as it normally uses $applyAsync()
    currentUserSessionsCtrlScope.$apply();

    //Check that the angular $scope is correctly updated
    currentUserSessionsCount = currentUserSessionsCtrlScope.currentUserSessions.length;
    assert.equal(currentUserSessionsCount, 1, "1 session should be in the session list");
    assert.equal(angular.element("#currentUserSessions").children("a").length, 1, "1 sessions should be displayed")

    //Remove first session in currentUserSessions
    CollabBookReader.getSessions().removeCurrentUserSession(sampleCurrentUserSessionList[0]._id);
    //Manually call .$apply() as it normally uses $applyAsync()
    currentUserSessionsCtrlScope.$apply();

    //Check that the angular $scope is correctly updated
    currentUserSessionsCount = currentUserSessionsCtrlScope.currentUserSessions.length;
    assert.equal(currentUserSessionsCount, 0, "0 sessions should be in the session list");
    assert.equal(angular.element("#currentUserSessions").children("a").length, 0, "0 sessions should be displayed")

    //Reset session list to previous value
    CollabBookReader.getSessions().setCurrentUserSessions(previousCurrentUserSessionList);
    currentlyActiveTabHeading.click();
});

QUnit.test("Sessions #12 - Remove a session from Available Sessions when it's added to My Sessions", function (assert) {
    //Store previous values
    var currentlyActiveTabHeading = angular.element("#sessionTabList").find("li .active");
    var previousAvailableSessionList = CollabBookReader.getSessions().getAvailableSessions();
    var previousCurrentUserSessionList = CollabBookReader.getSessions().getCurrentUserSessions();

    var availableSessionsCount, currentUserSessionsCount;
    //Get required angular scope
    var availableSessionsCtrlScope = angular.element($("#availableSessions")).scope();
    var currentUserSessionsCtrlScope = angular.element($("#currentUserSessions")).scope();

    //Set available sessions list to empty
    CollabBookReader.getSessions().setAvailableSessions([]);
    //Manually call .$apply() as it normally uses $applyAsync()
    availableSessionsCtrlScope.$apply();
    //Check that the angular $scope is correctly updated
    availableSessionsCount = availableSessionsCtrlScope.availableSessions.length;
    assert.equal(availableSessionsCount, 0, "0 sessions should be in the Available Sessions list");
    assert.equal(angular.element("#availableSessions").children("a").length, 0, "0 sessions should be displayed in the available sessions list");

    //Set my sessions list
    CollabBookReader.getSessions().setCurrentUserSessions([]);
    //Manually call .$apply() as it normally uses $applyAsync()
    currentUserSessionsCtrlScope.$apply();
    //Check that the angular $scope is correctly updated
    currentUserSessionsCount = currentUserSessionsCtrlScope.currentUserSessions.length;
    assert.equal(currentUserSessionsCount, 0, "0 sessions should be in the My Sessions list");
    assert.equal(angular.element("#currentUserSessions").children("a").length, 0, "0 sessions should be displayed in the current user sessions list");

    //Add session to Available Session list (to later add to My Sessions and check that it has been removed)
    CollabBookReader.getSessions().pushAvailableSession(sampleSession);
    //Manually call .$apply() as it normally uses $applyAsync()
    availableSessionsCtrlScope.$apply();
    //Check that the angular $scope is correctly updated
    availableSessionsCount = availableSessionsCtrlScope.availableSessions.length;
    assert.equal(availableSessionsCount, 1, "1 session should be in the Available Sessions list");
    assert.equal(angular.element("#availableSessions").children("a").length, 1, "1 session should be displayed in the available sessions list")

    //Add that same session into My Sessions
    CollabBookReader.getSessions().pushCurrentUserSession(sampleSession);
    //Manually call .$apply() as it normally uses $applyAsync()
    currentUserSessionsCtrlScope.$apply();
    //Check that the angular $scope is correctly updated
    currentUserSessionsCount = currentUserSessionsCtrlScope.currentUserSessions.length;
    assert.equal(currentUserSessionsCount, 1, "1 session should be in the My Sessions list");
    assert.equal(angular.element("#currentUserSessions").children("a").length, 1, "1 session should be displayed in the current user sessions list");

    availableSessionsCtrlScope.$apply();
    //Check that the angular $scope is correctly updated
    availableSessionsCount = availableSessionsCtrlScope.availableSessions.length;
    assert.equal(availableSessionsCount, 0, "0 sessions should be in the Available Sessions list");
    assert.equal(angular.element("#availableSessions").children("a").length, 0, "0 sessions should be displayed in the available sessions list")



    //Reset session list to previous value
    CollabBookReader.getSessions().setAvailableSessions(previousAvailableSessionList);
    CollabBookReader.getSessions().setCurrentUserSessions(previousCurrentUserSessionList);
    currentlyActiveTabHeading.click();
});