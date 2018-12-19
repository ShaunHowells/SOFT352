//Sample users to use in User tests
var sampleUser1 = {
    "_id": "sampleId1",
    "username": "ShaunH"
};

var sampleUser2 = {
    "_id": "sampleId2",
    "username": "JohnS"
};

var sampleUsers = [{
    "_id": "sampleId3",
    "username": "Jim"
}, {
    "_id": "sampleId4",
    "username": "Tim"
}];



/**
 * The 'Users' module contains all of the tests directly relating to the displaying of users. Users don't have any inherent functionality, but they are instead an extension of Sessions
 * These tests use sample data that is representative of actual session users. The sample data is used insted of needing multiple users each connected to the server via websockets.
 */
QUnit.module("Users");

/**
 * Display the set of users
 */
QUnit.test("Set list of Users", function(assert) {
    //STORE PREVIOUS VALUES
    //Get the currently active tab heading
    var currentlyActiveTab = angular.element("#sessionTabList").find("li .active");
    //Get the current currentUserSession
    var previousCurrentUserSession = CollabBookReader.getSessions().getCurrentUserSession();
    //Get the current users
    var previousUserList = CollabBookReader.getUsers().getUsers();

    //Click currentUserSession tab heading
    angular.element("#currentUserSessionTabHeading").click();

    //Get Angular scope for the 'My Session'
    var currentUserSessionCtrlScope = angular.element("#currentUserSession").scope();

    //Set the currentUserSession to the sampleCurrentUserSession - So we have a session to add users for
    CollabBookReader.getSessions().setCurrentUserSession(sampleCurrentUserSession);
    //Manually call $apply
    //The functions themselves use $applyAsync so we need to guarantee that the values have been updated before we check the values
    currentUserSessionCtrlScope.$apply();

    //Set current page to sample page so that the Notes tab content is shown
    CollabBookReader.getUsers().setUsers(sampleUsers);
    //Manually call .$apply() as it normally uses $applyAsync()
    currentUserSessionCtrlScope.$apply();

    //Check values of the Angular scope has been correctly updated
    assert.equal(currentUserSessionCtrlScope.currentUserSessionUsers.length, sampleUsers.length, sampleUsers.length + " users should be in the users list");
    //Check that the UI reflects the changes to the scope
    assert.equal(angular.element("#currentUserSessionUsers").children("li").length, sampleUsers.length, sampleUsers.length + " users should be displayed in the users list");

    //RESET TO PREVIOUS VALUES
    //Set the currentBookPage to previous value
    CollabBookReader.getUsers().getUsers(previousUserList);
    //Set the notes to previous value
    CollabBookReader.getSessions().setCurrentUserSession(previousCurrentUserSession);
    //Click the previously selected tab heading
    currentlyActiveTab.click();
});

/**
 * Remove all users
 */
QUnit.test("Clear list of Users", function(assert) {
    //STORE PREVIOUS VALUES
    //Get the currently active tab heading
    var currentlyActiveTab = angular.element("#sessionTabList").find("li .active");
    //Get the current currentUserSession
    var previousCurrentUserSession = CollabBookReader.getSessions().getCurrentUserSession();
    //Get the current users
    var previousUserList = CollabBookReader.getUsers().getUsers();

    //Click currentUserSession tab heading
    angular.element("#currentUserSessionTabHeading").click();

    //Get Angular scope for the 'My Session'
    var currentUserSessionCtrlScope = angular.element("#currentUserSession").scope();

    //Set the currentUserSession to the sampleCurrentUserSession - So we have a session to add users for
    CollabBookReader.getSessions().setCurrentUserSession(sampleCurrentUserSession);
    //Manually call $apply
    //The functions themselves use $applyAsync so we need to guarantee that the values have been updated before we check the values
    currentUserSessionCtrlScope.$apply();

    //Set current page to sample page so that the Notes tab content is shown
    CollabBookReader.getUsers().setUsers(sampleUsers);
    //Manually call .$apply() as it normally uses $applyAsync()
    currentUserSessionCtrlScope.$apply();

    CollabBookReader.getUsers().removeAllUsers();
    //Manually call .$apply() as it normally uses $applyAsync()
    currentUserSessionCtrlScope.$apply();

    //Check values of the Angular scope has been correctly updated
    assert.equal(currentUserSessionCtrlScope.currentUserSessionUsers.length, 0, "0 users should be in the users list");
    //Check that the UI reflects the changes to the scope
    assert.equal(angular.element("#currentUserSessionUsers").children("li").length, 0, "0 users should be displayed in the users list");

    //RESET TO PREVIOUS VALUES
    //Set the currentBookPage to previous value
    CollabBookReader.getUsers().getUsers(previousUserList);
    //Set the notes to previous value
    CollabBookReader.getSessions().setCurrentUserSession(previousCurrentUserSession);
    //Click the previously selected tab heading
    currentlyActiveTab.click();
});

/**
 * Add a user to the users list
 */
QUnit.test("Add user to the list of Users", function(assert) {
    //STORE PREVIOUS VALUES
    //Get the currently active tab heading
    var currentlyActiveTab = angular.element("#sessionTabList").find("li .active");
    //Get the current currentUserSession
    var previousCurrentUserSession = CollabBookReader.getSessions().getCurrentUserSession();
    //Get the current users
    var previousUserList = CollabBookReader.getUsers().getUsers();

    //Click currentUserSession tab heading
    angular.element("#currentUserSessionTabHeading").click();

    //Get Angular scope for the 'My Session'
    var currentUserSessionCtrlScope = angular.element("#currentUserSession").scope();

    //Set the currentUserSession to the sampleCurrentUserSession - So we have a session to add users for
    CollabBookReader.getSessions().setCurrentUserSession(sampleCurrentUserSession);
    //Manually call $apply
    //The functions themselves use $applyAsync so we need to guarantee that the values have been updated before we check the values
    currentUserSessionCtrlScope.$apply();

    //Remove all users so we start from 0 users
    CollabBookReader.getUsers().removeAllUsers();
    //Manually call .$apply() as it normally uses $applyAsync()
    currentUserSessionCtrlScope.$apply();

    //Add the first sample user
    CollabBookReader.getUsers().addUser(sampleUser1);
    //Manually call .$apply() as it normally uses $applyAsync()
    currentUserSessionCtrlScope.$apply();

    //Check values of the Angular scope has been correctly updated
    assert.equal(currentUserSessionCtrlScope.currentUserSessionUsers.length, 1, "1 user should be in the users list");
    //Check that the UI reflects the changes to the scope
    assert.equal(angular.element("#currentUserSessionUsers").children("li").length, 1, "1 user should be displayed in the users list");

    //Add the 2nd sample user
    CollabBookReader.getUsers().addUser(sampleUser2);
    //Manually call .$apply() as it normally uses $applyAsync()
    currentUserSessionCtrlScope.$apply();

    //Check values of the Angular scope has been correctly updated
    assert.equal(currentUserSessionCtrlScope.currentUserSessionUsers.length, 2, "2 users should be in the users list");
    //Check that the UI reflects the changes to the scope
    assert.equal(angular.element("#currentUserSessionUsers").children("li").length, 2, "2 users should be displayed in the users list");

    //RESET TO PREVIOUS VALUES
    //Set the currentBookPage to previous value
    CollabBookReader.getUsers().getUsers(previousUserList);
    //Set the notes to previous value
    CollabBookReader.getSessions().setCurrentUserSession(previousCurrentUserSession);
    //Click the previously selected tab heading
    currentlyActiveTab.click();
});

/**
 * Remove a user from the users list
 */
QUnit.test("Remove user from the list of Users", function(assert) {
    //STORE PREVIOUS VALUES
    //Get the currently active tab heading
    var currentlyActiveTab = angular.element("#sessionTabList").find("li .active");
    //Get the current currentUserSession
    var previousCurrentUserSession = CollabBookReader.getSessions().getCurrentUserSession();
    //Get the current users
    var previousUserList = CollabBookReader.getUsers().getUsers();

    //Click currentUserSession tab heading
    angular.element("#currentUserSessionTabHeading").click();

    //Get Angular scope for the 'My Session'
    var currentUserSessionCtrlScope = angular.element("#currentUserSession").scope();

    //Set the currentUserSession to the sampleCurrentUserSession - So we have a session to add users for
    CollabBookReader.getSessions().setCurrentUserSession(sampleCurrentUserSession);
    //Manually call $apply
    //The functions themselves use $applyAsync so we need to guarantee that the values have been updated before we check the values
    currentUserSessionCtrlScope.$apply();

    //Set our sample users
    CollabBookReader.getUsers().setUsers(sampleUsers);
    //Manually call .$apply() as it normally uses $applyAsync()
    currentUserSessionCtrlScope.$apply();

    //Remove the first user from our list
    CollabBookReader.getUsers().removeUser(sampleUsers[0]._id);
    //Manually call .$apply() as it normally uses $applyAsync()
    currentUserSessionCtrlScope.$apply();

    var expectedLength = sampleUsers.length - 1;

    //Check values of the Angular scope has been correctly updated
    assert.equal(currentUserSessionCtrlScope.currentUserSessionUsers.length, expectedLength, expectedLength + " users should be in the users list after one has been removed");
    //Check that the UI reflects the changes to the scope
    assert.equal(angular.element("#currentUserSessionUsers").children("li").length, expectedLength, expectedLength + " users should be displayed in the users list after one has been removed");

    //RESET TO PREVIOUS VALUES
    //Set the currentBookPage to previous value
    CollabBookReader.getUsers().getUsers(previousUserList);
    //Set the notes to previous value
    CollabBookReader.getSessions().setCurrentUserSession(previousCurrentUserSession);
    //Click the previously selected tab heading
    currentlyActiveTab.click();
});