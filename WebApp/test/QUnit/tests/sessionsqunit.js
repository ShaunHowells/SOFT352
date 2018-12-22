//Sample sessions for use in Sessions tests
var sampleAvailableSessionList = [{
        "currentBook": {
            "book_id": null,
            "title": "Shaun's Test Book"
        },
        "_id": "5c0936db8a7aa44ea0adf4be",
        "test": true,
        "name": "Yet another test",
        "owner": "753b5e0e-2c07",
        "users": [{
            "_id": "5c0936db8a7aa44ea0adf4bf",
            "user_id": "753b5e0e-2c07"
        }]
    },
    {
        "currentBook": {
            "book_id": null,
            "title": "Shaun's Test Book"
        },
        "_id": "5c0936e68a7aa44ea0adf4c0",
        "test": true,
        "name": "My Session",
        "owner": "65382863-fe2c",
        "users": [{
            "_id": "5c0936e68a7aa44ea0adf4c1",
            "user_id": "65382863-fe2c"
        }]
    }
];
var sampleSession = {
    "currentBook": {
        "book_id": null,
        "title": "Shaun's Test Book"
    },
    "_id": "5c0936bd8a7aa44ea0adf4bc",
    "test": true,
    "name": "Test",
    "owner": "036438b0-2515",
    "users": [{
        "_id": "5c0936bd8a7aa44ea0adf4bd",
        "user_id": "036438b0-2515"
    }]
};
var sampleCurrentUserSession = {
    "currentBook": {
        "book_id": null,
        "title": "Shaun's Test Book"
    },
    "_id": "5c091af0f5659f1ff48f6b8f",
    "test": true,
    "name": "Test",
    "owner": "ad3ccf43-ea77",
    "users": [{
        "_id": "5c091af0f5659f1ff48f6b90",
        "user_id": "ad3ccf43-ea77"
    }]
};

/**
 * The 'Sessions' module contains all of the tests directly relating to the displaying of Sessions. This does not test the functionality of the sessions themselves, only show the UI interactions with them
 * These tests use sample data that is representative of actual sessions. The sample data is used instead querying the database.
 */
QUnit.module("Sessions");

//TODO: See if I can remove calls to $apply. Currently using them as I'm using $applyAsync() in the actual code

/**
 * Show 'Available Sessions' tab content - Test that the 'Available Sessions' tab content can be displayed
 */
QUnit.test("Show 'Available Sessions' tab content", function(assert) {
    //STORE PREVIOUS VALUES
    //Get the currently active tab heading
    var currentlyActiveTab = angular.element("#sessionTabList").find("li .active");

    //Click 'Available Sessions' tab heading
    angular.element("#availableSessionsTabHeading").click();

    //Check that the 'Available Sessions' tab content is now visible
    assert.ok(angular.element("#availableSessions").is(":visible"), "'Available Sessions' tab content should be visible");

    //RESET TO PREVIOUS VALUES
    //Click the previously selected tab heading
    currentlyActiveTab.click();
});

/**
 * Set 'Available Sessions' list - Test that the 'Available Sessions' list is updated when the 'Available Sessions' Angular scope is set
 */
QUnit.test("Set 'Available Sessions' list", function(assert) {
    //STORE PREVIOUS VALUES
    //Get the currently active tab heading
    var currentlyActiveTab = angular.element("#sessionTabList").find("li .active");
    //Get the current availableSessions
    var previousAvailableSessionsList = CollabBookReader.getSessions().getAvailableSessions();

    //Click 'Available Sessions' tab heading
    angular.element("#availableSessionsTabHeading").click();

    //Get Angular scope for the 'Available Sessions' list
    var availableSessionsCtrlScope = angular.element("#availableSessions").scope();

    //Set availableSessions to an empty array (no sessions available)
    CollabBookReader.getSessions().setAvailableSessions([]);
    //Manually call $apply
    //The functions themselves use $applyAsync so we need to guarantee that the values have been updated before we check the values
    availableSessionsCtrlScope.$apply();

    //Check that availableSessionsCtrlScope is correctly updated 
    assert.equal(availableSessionsCtrlScope.availableSessions.length, 0, 0 + " sessions should be available in the 'Available Sessions' Angular scope");
    //Check that the correct number of list elements is displayed
    assert.equal(angular.element("#availableSessions").children("a").length, 0, 0 + " sessions should be displayed in the 'Available Sessions' list");

    //Set availableSessions to our sample available sessions list
    CollabBookReader.getSessions().setAvailableSessions(sampleAvailableSessionList);
    //Manually call $apply
    //The functions themselves use $applyAsync so we need to guarantee that the values have been updated before we check the values
    availableSessionsCtrlScope.$apply();

    //Get length of sampleAvailableSessionList
    var udpatedListCount = sampleAvailableSessionList.length;

    //Check that availableSessionsCtrlScope is correctly updated
    assert.equal(availableSessionsCtrlScope.availableSessions.length, udpatedListCount, udpatedListCount + " sessions should be available in the 'Available Sessions' Angular scope");
    //Check that the correct number of list elements is displayed
    assert.equal(angular.element("#availableSessions").children("a").length, udpatedListCount, udpatedListCount + " sessions should be displayed in the 'Available Sessions' list");

    //RESET TO PREVIOUS VALUES
    //Set availableSessions back to previous value
    CollabBookReader.getSessions().setAvailableSessions(previousAvailableSessionsList);
    //Click the previously selected tab heading
    currentlyActiveTab.click();
});

/**
 * Add new session to 'Available Session' list - Test that the 'Available Sessions' list is updated when a new session is added to the 'Available Sessions' Angular scope
 */
QUnit.test("Add new session to 'Available Session' list", function(assert) {
    //STORE PREVIOUS VALUES
    //Get the currently active tab heading
    var currentlyActiveTab = angular.element("#sessionTabList").find("li .active");
    //Get the current availableSessions
    var previousAvailableSessionsList = CollabBookReader.getSessions().getAvailableSessions();

    //Click 'Available Sessions' tab heading
    angular.element("#availableSessionsTabHeading").click();

    //Get Angular scope for the 'Available Sessions' list
    var availableSessionsCtrlScope = angular.element("#availableSessions").scope();

    //Set availableSessions to our sample session list
    CollabBookReader.getSessions().setAvailableSessions(sampleAvailableSessionList);

    //Add a new session to availableSessions
    CollabBookReader.getSessions().pushAvailableSession(sampleSession);
    //Manually call $apply
    //The functions themselves use $applyAsync so we need to guarantee that the values have been updated before we check the values
    availableSessionsCtrlScope.$apply();

    //Get expected length of availableSessionList - Length of sampleAvailableSessionList + 1 (for newly added session)
    var updatedListCount = sampleAvailableSessionList.length + 1;

    //Check that availableSessionsCtrlScope is correctly updated
    assert.equal(availableSessionsCtrlScope.availableSessions.length, updatedListCount, updatedListCount + " sessions should be available after adding the new session");
    //Check that the correct number of list elements is displayed
    assert.equal(angular.element("#availableSessions").children("a").length, updatedListCount, updatedListCount + " sessions should be displayed in the 'Available Sessions' list after adding the new session");


    //RESET TO PREVIOUS VALUES
    //Set availableSessions back to previous value
    CollabBookReader.getSessions().setAvailableSessions(previousAvailableSessionsList);
    //Click the previously selected tab heading
    currentlyActiveTab.click();
});

/**
 * Remove session from 'Available Sessions' list - Test that the 'Available Sessions' list is updated a session is removed from the 'Available Sessions' Angular scope
 */
QUnit.test("Remove session from 'Available Sessions' list", function(assert) {
    //STORE PREVIOUS VALUES
    //Get the currently active tab heading
    var currentlyActiveTab = angular.element("#sessionTabList").find("li .active");
    //Get the current availableSessions
    var previousAvailableSessionsList = CollabBookReader.getSessions().getAvailableSessions();

    //Click 'Available Sessions' tab heading
    angular.element("#availableSessionsTabHeading").click();

    //Get Angular scope for the 'Available Sessions' list
    var availableSessionsCtrlScope = angular.element("#availableSessions").scope();

    //Set availableSessions to our sample session list
    CollabBookReader.getSessions().setAvailableSessions(sampleAvailableSessionList);

    //Remove first session in the 'Available Sessions' list
    CollabBookReader.getSessions().removeAvailableSession(sampleAvailableSessionList[0]._id);
    //Manually call $apply
    //The functions themselves use $applyAsync so we need to guarantee that the values have been updated before we check the values
    availableSessionsCtrlScope.$apply();

    //Get expected length of availableSessionList - Length of sampleAvailableSessionList - 1 (for recently removed session)
    var updatedListCount = sampleAvailableSessionList.length - 1;

    //Check that availableSessionsCtrlScope is correctly updated
    assert.equal(availableSessionsCtrlScope.availableSessions.length, updatedListCount, updatedListCount + " sessions should be available after removing an available session");
    //Check that the correct number of list elements is displayed
    assert.equal(angular.element("#availableSessions").children("a").length, updatedListCount, updatedListCount + " sessions should be displayed in the 'Available Sessions' list after removing an available session");

    //RESET TO PREVIOUS VALUES
    //Set availableSessions back to previous value
    CollabBookReader.getSessions().setAvailableSessions(previousAvailableSessionsList);
    //Click the previously selected tab heading
    currentlyActiveTab.click();
});

/**
 * View details for a session in the 'Available Sessions' list - Test that you can view the details of a session in the 'Available Sessions' by clicking on it
 */
QUnit.test("View details for a session in the 'Available Sessions' list", function(assert) {
    //STORE PREVIOUS VALUES
    //Get the currently active tab heading
    var currentlyActiveTab = angular.element("#sessionTabList").find("li .active");
    //Get the current availableSessions
    var previousAvailableSessionsList = CollabBookReader.getSessions().getAvailableSessions();

    //Click 'Available Sessions' tab heading
    angular.element("#availableSessionsTabHeading").click();

    //Get Angular scope for the 'Available Sessions' list
    var availableSessionsCtrlScope = angular.element("#availableSessions").scope();

    //Set availableSessions to our sample session list
    CollabBookReader.getSessions().setAvailableSessions(sampleAvailableSessionList);
    //Manually call $apply
    //The functions themselves use $applyAsync so we need to guarantee that the values have been updated before we check the values
    availableSessionsCtrlScope.$apply();

    //Select the first session in the 'Available Sessions' list to display the details
    angular.element("#availableSessionId" + sampleAvailableSessionList[0]._id).click();

    //Check that the modal popup is current displayed
    assert.ok(angular.element("#availableSessionDetailsModal").is(":visible"), "Available Sessions Details are currently being displayed");

    //Get displayed user session variable used in session details
    var displaySession = angular.element("#availableSessionDetailsModal").scope().displaySession;
    //Check values of the Angular scope are the same as the session that was selected in the list
    assert.equal(displaySession._id, sampleAvailableSessionList[0]._id, "Displayed session Angular scope has the correct _id");
    assert.equal(displaySession.name, sampleAvailableSessionList[0].name, "Displayed session Angular scope has the correct name");
    assert.equal(displaySession.currentBook.title, sampleAvailableSessionList[0].currentBook.title, "Displayed session Angular scope has the correct owner");
    assert.equal(displaySession.owner, sampleAvailableSessionList[0].owner, "Displayed session Angular scope has the correct owner");
    //Check that the UI is displaying the same details as the session that was selected
    assert.equal(angular.element("#displayedSessionName").html(), sampleAvailableSessionList[0].name, "Available session details has the correct name");
    assert.equal(angular.element("#displayedSessionBookTitle").html(), sampleAvailableSessionList[0].currentBook.title, "Available session details has the correct book title");
    assert.equal(angular.element("#displayedSessionOwner").html(), sampleAvailableSessionList[0].owner, "Available session details has the correct owner");

    //Hide displayed 'Available Session' details modal
    angular.element("#availableSessionDetailsModalClose").click();

    //RESET TO PREVIOUS VALUES
    //Set availableSessions back to previous value
    CollabBookReader.getSessions().setAvailableSessions(previousAvailableSessionsList);
    //Click the previously selected tab heading
    currentlyActiveTab.click();
});

/**
 * Show 'My Session' tab content - Test that the 'My Session' tab content can be displayed. 'Create new Session' should be shown when there isn't a currentUserSession
 */
QUnit.test("Show 'My Session' tab content", function(assert) {
    //STORE PREVIOUS VALUES
    //Get the currently active tab heading
    var currentlyActiveTab = angular.element("#sessionTabList").find("li .active");

    //Click 'My Session' tab heading
    angular.element("#currentUserSessionTabHeading").click();

    //Check that the 'My Session' tab content is now visible
    assert.ok(angular.element("#currentUserSession").is(":visible"), "My session tab content should be visible");

    //'Create a new session' should be visible, while current session details should be hidden
    assert.ok(angular.element("#currentUserSessionCreate").is(":visible"), "'Create a new session' should be visible");
    assert.ok(!angular.element("#currentUserSessionDetails").is(":visible"), "Current Session Details should be hidden");

    //RESET TO PREVIOUS VALUES
    //Click the previously selected tab heading
    currentlyActiveTab.click();
});

/**
 * Set current user session - Test that the 'My Session' tab content shows session details the user is in a session
 */
QUnit.test("Set current user session", function(assert) {
    //STORE PREVIOUS VALUES
    //Get the currently active tab heading
    var currentlyActiveTab = angular.element("#sessionTabList").find("li .active");
    //Get the current currentUserSession
    var previousCurrentUserSession = CollabBookReader.getSessions().getCurrentUserSession();

    //Click currentUserSession tab heading
    angular.element("#currentUserSessionTabHeading").click();

    //Get Angular scope for the 'My Session'
    var currentUserSessionCtrlScope = angular.element("#currentUserSession").scope();

    //Remove current user session
    CollabBookReader.getSessions().removeCurrentUserSession();
    //Manually call $apply
    //The functions themselves use $applyAsync so we need to guarantee that the values have been updated before we check the values
    currentUserSessionCtrlScope.$apply();

    //Check that 'Create a new session' is displayed and currentUserSession details are hidden
    assert.ok(angular.element("#currentUserSessionCreate").is(":visible"), "'Create a new session' should be visible");
    assert.ok(!angular.element("#currentUserSessionDetails").is(":visible"), "Current Session Details should be hidden");

    //Set the currentUserSession to the sampleCurrentUserSession
    CollabBookReader.getSessions().setCurrentUserSession(sampleCurrentUserSession);
    //Manually call $apply
    //The functions themselves use $applyAsync so we need to guarantee that the values have been updated before we check the values
    currentUserSessionCtrlScope.$apply();

    //Check that currentUserSession details are displayed and 'Create a new session' is hidden
    assert.ok(!angular.element("#currentUserSessionCreate").is(":visible"), "'Create a new session' should be hidden");
    assert.ok(angular.element("#currentUserSessionDetails").is(":visible"), "Current Session Details should be visible");

    //Check values of the Angular scope are the same as the session that that was set as the currentUserSession
    var currentUserSession = currentUserSessionCtrlScope.currentUserSession;
    assert.equal(currentUserSession._id, sampleCurrentUserSession._id, "Current session scope has correct _id");
    assert.equal(currentUserSession.name, sampleCurrentUserSession.name, "Current session scope has correct name");
    assert.equal(currentUserSession.owner, sampleCurrentUserSession.owner, "Current session scope has correct owner");
    //Check that the UI is displaying the same details as the session that was set as the currentUserSession
    assert.equal(angular.element("#currentUserSessionName").html(), sampleCurrentUserSession.name, "Displayed session has the correct name");
    assert.equal(angular.element("#currentUserSessionBookTitle").html(), sampleCurrentUserSession.currentBook.title, "Displayed session has the correct book title");
    assert.equal(angular.element("#currentUserSessionOwner").html(), sampleCurrentUserSession.owner, "Displayed session has the correct owner");

    //RESET TO PREVIOUS VALUES
    //Set currentUserSession back to previous value
    CollabBookReader.getSessions().setCurrentUserSession(previousCurrentUserSession);
    //Click the previously selected tab heading
    currentlyActiveTab.click();
});

/**
 * Remove current user session - Test that the 'My Session' tab content shows 'Create a new session' after leaving a session
 */
QUnit.test("Remove current user session", function(assert) {
    //STORE PREVIOUS VALUES
    //Get the currently active tab heading
    var currentlyActiveTab = angular.element("#sessionTabList").find("li .active");
    //Get the current currentUserSession
    var previousCurrentUserSession = CollabBookReader.getSessions().getCurrentUserSession();

    //Click currentUserSession tab heading
    angular.element("#currentUserSessionTabHeading").click();

    //Get Angular scope for the 'My Session'
    var currentUserSessionCtrlScope = angular.element("#currentUserSession").scope();

    //Set the currentUserSession to sampleCurrentUserSession
    CollabBookReader.getSessions().setCurrentUserSession(sampleCurrentUserSession);

    //Remove currentUserSession - No longer in a session
    CollabBookReader.getSessions().removeCurrentUserSession();
    //Manually call $apply
    //The functions themselves use $applyAsync so we need to guarantee that the values have been updated before we check the values
    currentUserSessionCtrlScope.$apply();

    //Check that 'Create a new session' is displayed and currentUserSession details are hidden
    assert.ok(angular.element("#currentUserSessionCreate").is(":visible"), "'Create a new session' should be visible");
    assert.ok(!angular.element("#currentUserSessionDetails").is(":visible"), "Current user session details should be hidden");

    //Check that the value Angular scope are is empty
    var currentUserSession = currentUserSessionCtrlScope.currentUserSession;
    assert.ok(!currentUserSession, "Current session should be null");

    //RESET TO PREVIOUS VALUES
    //Set currentUserSession back to previous value
    CollabBookReader.getSessions().setCurrentUserSession(previousCurrentUserSession);
    //Click the previously selected tab heading
    currentlyActiveTab.click();
});

/**
 * Display 'Create new session' popup - Test that clicking 'Create a new session' button in the 'My Session' tab content shows the 'Create a new session' modal popup
 */
QUnit.test("Display 'Create new session' popup", function(assert) {
    //STORE PREVIOUS VALUES
    //Get the currently active tab heading
    var currentlyActiveTab = angular.element("#sessionTabList").find("li .active");
    //Get the current currentUserSession
    var previousCurrentUserSession = CollabBookReader.getSessions().getCurrentUserSession();

    //Click currentUserSession tab heading
    angular.element("#currentUserSessionTabHeading").click();

    //Click the 'Create a new session' button
    angular.element("#createNewSession").click();
    //Check that the 'Create a new session' modal popup is displayed
    assert.ok(angular.element("#createNewSessionModal").is(":visible"), "'Create a new session' popup is currently being displayed");

    //Check that the values of the user inputs are empty when displaying the 'Create a new session' popup
    assert.equal(angular.element("#createNewSessionName").val(), "", "Session name should be empty");
    assert.equal(angular.element("#createNewSessionBook").val(), null, "Session book should be empty");

    //Set values in 'Create a new session' popup - Only set the 'name' as we can't know the names of the books without database access
    angular.element("#createNewSessionName").val("QUnit Test Session");

    //Close 'Create a new Session' popup
    angular.element("#createNewSessionModalClose").click();
    //Check that the 'Create a new session' popup is no longer visible
    assert.ok(!angular.element("#createNewSessionModal").is(":visible"), "'Create a new session' popup should now be hidden");

    //Reopen 'Create a new Session' popup to check that the values have been reset
    angular.element("#createNewSession").click();
    assert.equal(angular.element("#createNewSessionName").val(), "", "Session name should have been reset after re-opening the popup");
    assert.equal(angular.element("#createNewSessionBook").val(), null, "Session book should be have been reset after opening the popup");

    //Close 'Create a new session' popup
    angular.element("#createNewSessionModalClose").click();

    //RESET TO PREVIOUS VALUES
    //Set currentUserSession back to previous value
    CollabBookReader.getSessions().setCurrentUserSession(previousCurrentUserSession);
    //Click the previously selected tab heading
    currentlyActiveTab.click();
});

/**
 * Session should be removed from 'Available Sessions' when the user is in that session - Test that the users current session isn't displayed in the 'Available Sessions' list
 */
QUnit.test("Remove session from 'Available Sessions' when the user is in that session", function(assert) {
    //STORE PREVIOUS VALUES
    //Get the currently active tab heading
    var currentlyActiveTab = angular.element("#sessionTabList").find("li .active");
    //Get the current availableSessions
    var previousAvailableSessionsList = CollabBookReader.getSessions().getAvailableSessions();
    //Get the current currentUserSession
    var previousCurrentUserSession = CollabBookReader.getSessions().getCurrentUserSession();

    //Get Angular scope for the 'Available Sessions'
    var availableSessionsCtrlScope = angular.element("#availableSessions").scope();
    //Get Angular scope for the 'My Session'
    var currentUserSessionCtrlScope = angular.element("#currentUserSession").scope();

    //Remove current user session
    CollabBookReader.getSessions().removeCurrentUserSession();

    //Set availableSessions to our sample session list
    CollabBookReader.getSessions().setAvailableSessions(sampleAvailableSessionList);
    //Manually call $apply
    //The functions themselves use $applyAsync so we need to guarantee that the values have been updated before we check the values
    availableSessionsCtrlScope.$apply();

    //Set the first session from out sampleAvailableSessionList to our currentUserSession 
    CollabBookReader.getSessions().setCurrentUserSession(sampleAvailableSessionList[0]);
    //Manually call $apply
    //The functions themselves use $applyAsync so we need to guarantee that the values have been updated before we check the values
    currentUserSessionCtrlScope.$apply();

    //Get expected length of availableSessionList - Length of sampleAvailableSessionList - 1 (for the session that we are now in)
    var expectedAvailableSessionsLength = sampleAvailableSessionList.length - 1;

    //Check that availableSessionsCtrlScope is correctly updated to not display the currentUserSession
    assert.equal(availableSessionsCtrlScope.availableSessions.length, expectedAvailableSessionsLength, expectedAvailableSessionsLength + " sessions should be available after removing an available session");
    //Check that the UI is displaying the expected number of available sessions - Shouldn't include currentUserSession
    assert.equal(angular.element("#availableSessions").children("a").length, expectedAvailableSessionsLength, expectedAvailableSessionsLength + " sessions should be displayed in the available sessions list");

    //RESET TO PREVIOUS VALUES
    //Set availableSessions back to previous value
    CollabBookReader.getSessions().setAvailableSessions(previousAvailableSessionsList);
    //Set currentUserSession back to previous value
    CollabBookReader.getSessions().setCurrentUserSession(previousCurrentUserSession);
    //Click the previously selected tab heading
    currentlyActiveTab.click();
});

/**
 * When a session is removed from the available sessions list while the user is looking at the session details it should be closed and an alert should be displayed
 */
QUnit.test("Close available session details popup when viewing details of a session that no longer exists", function(assert) {
    //STORE PREVIOUS VALUES
    //Get the currently active tab heading
    var currentlyActiveTab = angular.element("#sessionTabList").find("li .active");
    //Get the current availableSessions
    var previousAvailableSessionsList = CollabBookReader.getSessions().getAvailableSessions();

    //Click 'Available Sessions' tab heading
    angular.element("#availableSessionsTabHeading").click();

    //Get Angular scope for the 'Available Sessions' list
    var availableSessionsCtrlScope = angular.element("#availableSessions").scope();

    //Set availableSessions to our sample session list
    CollabBookReader.getSessions().setAvailableSessions(sampleAvailableSessionList);
    //Manually call $apply
    //The functions themselves use $applyAsync so we need to guarantee that the values have been updated before we check the values
    availableSessionsCtrlScope.$apply();

    //Select the first session in the 'Available Sessions' list to display the details
    angular.element("#availableSessionId" + sampleAvailableSessionList[0]._id).click();

    //Check that the modal popup is current displayed
    assert.ok(angular.element("#availableSessionDetailsModal").is(":visible"), "Available Sessions Details are currently being displayed");

    //Remove the session whose details we are viewing
    CollabBookReader.getSessions().removeAvailableSession(sampleAvailableSessionList[0]._id);

    //The modal popup should have been closed (as the session itself no longer exists);
    assert.ok(!angular.element("#availableSessionDetailsModal").is(":visible"), "Available Sessions Details should have been closed");
    assert.ok(angular.element("#sessionNoLongerAvailableAlert").is(":visible"), "The alert for the session no longer being available should be visible");

    angular.element("#sessionNoLongerAvailableClose").click();

    assert.ok(!angular.element("#sessionNoLongerAvailableAlert").is(":visible"), "The alert for the session no longer being available should no longer be visible");

    //RESET TO PREVIOUS VALUES
    //Set availableSessions back to previous value
    CollabBookReader.getSessions().setAvailableSessions(previousAvailableSessionsList);
    //Click the previously selected tab heading
    currentlyActiveTab.click();
});