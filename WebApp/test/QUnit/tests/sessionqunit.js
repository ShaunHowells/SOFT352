//Variables required to use Angular
var injector = angular.injector(['ng', 'AngularMainApp']); // used to get dependencies like controllers / filters etc
var ctrlScope = {}; // a clean scope to test
var $controllers = injector.get('$controller'); //get injector that can retrieve controllers 
var $filters = injector.get("$filter"); // get filter injector
var someService; // define a global used in all tests

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

QUnit.module('Sessions', { // define the module - qualify with QUnit namespace to avoid conflict with Angular
    previousAvailableSessionList: null,

    before: function () {
        CollabBookReader.stopWebSocketConnection();
    },
    after: function () {
        CollabBookReader.startWebSocketConnection();
    }
    // beforeEach: function () {
    //     previousAvailableSessionList = CollabBookReader.getSessions().getAvailableSessions();
    // },
    // afterEach: function () {
    //     CollabBookReader.getSessions().setAvailableSessions(previousAvailableSessionList);
    // }
});

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

QUnit.test("Session #5 - View session details", function (assert) {
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
    angular.element("#availablesessionId" + sampleAvailableSessionList[0]._id).click();

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

QUnit.test("Session #6 - Add sessions to current user sessions list", function (assert) {
    //Store previous values
    var previousCurrentUserSessionList = CollabBookReader.getSessions().getCurrentUserSessions();

    var currentUserSessionsCount;
    //Get required angular scope
    var currentUserSessionsCtrlScope = angular.element($("#currentUserSessions")).scope();

    CollabBookReader.getSessions().setCurrentUserSessions([]);

    //Check that the angular $scope is correctly updated
    currentUserSessionsCount = currentUserSessionsCtrlScope.currentUserSessions.length;
    assert.equal(currentUserSessionsCount, 0, "0 sessions should be in the current user Sessions list");

    //As I'm not testing the server functionality here, I'll use sample data to update mySessions can check the reponse is correct
    CollabBookReader.getSessions().setCurrentUserSessions(sampleCurrentUserSessionList);

    //Check that the angular $scope is correctly updated
    currentUserSessionsCount = currentUserSessionsCtrlScope.currentUserSessions.length;
    assert.equal(currentUserSessionsCount, 1, "1 session should be in the session list");

    //Reset session list to previous value
    CollabBookReader.getSessions().setCurrentUserSessions(previousCurrentUserSessionList);
});

QUnit.test("Session #7 - Add new session to current user sessions list", function (assert) {
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