//Variables used by all tests
var testSessionName = "QUnit Test Session";
var testSessionBook = "shauntestbook";

//Test that the list of sessions can be retrieved - Happens on-load/as part of an Angular controller
QUnit.test("Session #1 - Session Retrieved", function (assert) {
    var sessions = new Sessions();

    //Test successful creation
    assert.ok(sessions, "Sessions object created successfully");
    assert.ok(!sessions.getAvailableSessions(), 0, "Newly created sessions object does not have an available sessions list");

    //Retrieve available sessions from DB

    //Check session list is created
    assert.ok(sessions.sessions.retrieveAvailableSessions() !== null, "Available sessions list is now initialised");
});

//Upon clicking the join session button, and inputting the required information, the user should be able to create a session
QUnit.test("Session #2 - Session created via UI interaction", function (assert) {
    //Create required objects
    var user = new user("ShaunTest");
    var sessions = new Sessions(user);

    //Test initial object state
    assert.ok(user, "User successfully created");
    assert.ok(sessions, "Sessions object created successfully");
    assert.ok(!sessions.getCurrentUserSessions(), "Newly created sessions object does not have a user sessions list");

    //Retrieve current user sessions
    var userSessions = sessions.retrieveCurrentUserSessions();

    //Test that sessions have been retrieved and that the user is not currently in any sessions
    assert.ok(userSessions, "Current user sessions retrieved");
    assert.equals(userSessions.length, 0, "User is not in any current sessions");

    //Simulate user input to create a session
    $("#createSession").click();
    $("#createSessionName").val(testSessionName);
    $("#createSessionBook").val(testSessionBook);
    $("#createSessionSubmit").click();

    //Get users current sessions
    var updatedUserSessions = sessions.retrieveCurrentUserSessions();
    //Test that sessions have been retrieved and that the user is not currently in any sessions
    assert.ok(updatedUserSessions, "Current user sessions retrieved");
    assert.equals(updatedUserSessions.length, 1, "User created a session and has been joined to it");

    //Extract session and book from the retrieved session
    var session = new Session(updatedUserSessions[0]);
    var book = new Book(session.book);
    //Check session name and book name is the value specified earlier
    assert.equals(session.name, testSessionName, "Session created with corrrect name");
    assert.equals(book.name, testBookName, "Session showing correct book");

    //CLEANUP - Leave the session
    leaveSession(user, session);
});

//Using the Sessions/Session/User classes a user should be able to create a session
QUnit.test("Session #3 - Session created via object calls", function (assert) {
    //Create required objects
    var user = new user("ShaunTest");
    var sessions = new Sessions(user);

    //Test initial object state
    assert.ok(user, "User successfully created");
    assert.ok(sessions, "Sessions object created successfully");
    assert.ok(!sessions.getCurrentUserSessions(), "Newly created sessions object does not have a user sessions list");

    //Retrieve current user sessions
    var userSessions = sessions.retrieveCurrentUserSessions();

    //Test that sessions have been retrieved and that the user is not currently in any sessions
    assert.ok(userSessions, "Current user sessions retrieved");
    assert.equals(userSessions.length, 0, "User is not in any current sessions");

    //Add test values to session object
    createSession(testSessionName, testSessionBook, user);

    var updatedUserSessions = sessions.retrieveCurrentUserSessions();
    //Test that sessions have been retrieved and that the user is not currently in any sessions
    assert.ok(updatedUserSessions, "Current user sessions retrieved");
    assert.equals(updatedUserSessions.length, 1, "User created a session and has been joined to it");

    //Extract session and book from the retrieved session
    var session = new Session(updatedUserSessions[0]);
    var book = new Book(session.book);
    //Check session name and book name is the value specified earlier
    assert.equals(session.name, testSessionName, "Session created with corrrect name");
    assert.equals(book.name, testBookName, "Session showing correct book");

    //CLEANUP - Leave the session
    leaveSession(user, session);
});

//Upon clicking the a session a popup with more information should be shown. Clicking the "Join session" button in the popup should join the session
QUnit.test("Session #4 - Session joined via UI interaction", function (assert) {
    //Create required objects
    var sessionOwner = new User("ShaunTest");
    var sessionJoiner = new User("John Smith");
    var sessions = new Sessions(sessionJoiner);

    //Test initial object state
    assert.ok(sessionOwner, "Session owner user successfully created");
    assert.ok(sessionJoiner, "Session joiner user successfully created");
    assert.ok(sessions, "Sessions object created successfully");
    assert.ok(!sessions.getAvailableSessions(), "Newly created sessions object does not have any available sessions list");

    //Check that no sessions are available to start with
    availableSessions = sessions.retrieveAvailableSessions();
    assert.ok(availableSession, "Available sessions initialised");
    assert.equals(availableSessions.length, 0, "No sessions should be available");

    //Check that session joiner isn't in any sessions
    var userSessions = sessions.retrieveAvailableSessions();
    assert.ok(userSessions, "Current user sessions retrieved");
    assert.equals(userSessions.length, 0, "User has no current sessions");

    //Make sessionOwner create a session so that sessionJoiner can join
    var testSession = new Session();
    testSession.name = testSessionName;
    testSession.book = new Book(testSessionBook);
    testSession.owner = sessionOwner;
    //Create the session
    testSession.create();

    //Check that test session has been added so sessionJoiner can join the session
    availableSessions = sessions.retrieveAvailableSessions();
    assert.ok(availableSession, "Available sessions initialised");
    assert.equals(availableSessions.length, 1, "Newly created session now present in list");

    //We expect that a session has appeared in the list now that a session has been created
    assert.ok(($("#availablesessionId1").length == true), "Session has appeared in the list of available sessions");
    $("#availablesessionId1").click();
    $("#joinSession").click();

    //Retrieve current user sessions to check user was joined to session
    var updatedUserSessions = sessions.retrieveCurrentUserSessions ()
    assert.ok(updatedUserSessions, "Current user sessions retrieved");
    assert.equals(updatedUserSessions.length, 1, "User correctly joined session");

    //Extract session and book from the retrieved session
    var session = new Session(updatedUserSessions[0]);
    var book = new Book(session.book);
    //Check session name and book name is the value specified earlier
    assert.equals(session.name, testSessionName, "Session created with corrrect name");
    assert.equals(book.name, testBookName, "Session showing correct book");

    //CLEANUP - Leave the session
    leaveSession(sessionJoiner, session);
    leaveSession(sessionOwner, session);
});

//Sessions/Session/User classes should allow a user to join an available session
QUnit.test("Session #5 - Session joined via object calls", function (assert) {
    //Create required objects
    var sessionOwner = new user("ShaunTest");
    var sessionJoiner = new User("John Smith");
    var sessions = new Sessions(sessionJoiner);

    //Test initial object state
    assert.ok(sessionOwner, "Session owner user successfully created");
    assert.ok(sessionJoiner, "Session joiner user successfully created");
    assert.ok(sessions, "Sessions object created successfully");
    assert.ok(!sessions.getAvailableSessions(), "Newly created sessions object does not have any available sessions list");

    //Check that no sessions are available to start with
    availableSessions = sessions.retrieveAvailableSessions();
    assert.ok(availableSession, "Available sessions initialised");
    assert.equals(availableSessions.length, 0, "No sessions should be available");

    //Check that session joiner isn't in any sessions
    sessions.setUser(sessionJoiner);
    var userSessions = sessions.retrieveCurrentUserSessions();
    assert.ok(userSessions, "Current user sessions retrieved");
    assert.equals(userSessions.length, 0, "User has no current sessions");

    //Make sessionOwner create a session so that sessionJoiner can join
    createSession(testSessionName, testSessionBook, sessionOwner);

    //Check that test session has been added so sessionJoiner can join the session
    availableSessions = sessions.retrieveAvailableSessions();
    assert.ok(availableSession, "Available sessions initialised");
    assert.equals(availableSessions.length, 1, "Newly created session now present in list");

    //We expect that a session has appeared in the list now that a session has been created
    var session = new Session(sessions[0]);
    sessions.join(session);

    //Retrieve current user sessions to check user was joined to session
    sessions.setUser(sessionJoiner);
    var updatedUserSessions = sessions.retrieveCurrentUserSessions()
    assert.ok(updatedUserSessions, "Current user sessions retrieved");
    assert.equals(updatedUserSessions.length, 1, "User correctly joined session");

    //Extract session and book from the retrieved session
    var session = new Session(updatedUserSessions[0]);
    var book = new Book(session.book);
    //Check session name and book name is the value specified earlier
    assert.equals(session.name, testSessionName, "Session created with corrrect name");
    assert.equals(book.name, testBookName, "Session showing correct book");

    //CLEANUP - Leave the session
    leaveSession(sessionJoiner, session);
    leaveSession(sessionOwner, session);
});

//User should be able to use the UI to leave a session
QUnit.test("Session #6 - Session left via UI interaction", function (assert) {
    //Create required objects
    var user = new user("ShaunTest");
    var sessions = new Sessions(user);

    //Test initial object state
    assert.ok(user, "Session owner user successfully created");
    assert.ok(sessions, "Sessions object created successfully");
    assert.ok(!sessions.getAvailableSessions(), "Newly created sessions object does not have any available sessions list");

    //Check that no sessions are available to start with
    availableSessions = sessions.retrieveAvailableSessions();
    assert.ok(availableSession, "Available sessions initialised");
    assert.equals(availableSessions.length, 0, "No sessions should be available");

    //Make user create a session so he can leave
    createSession(testSessionName, testSessionBook, user);

    //Check that test session has been added so user can leave
    var currentUserSessions = sessions.retrieveCurrentUserSessions();
    assert.ok(currentUserSessions, "Current user sessions initialised");
    assert.equals(currentUserSessions.length, 1, "Newly created session now present in list");

    //MySession list should have an element added to it for the newly created session
    //Check it exists, then click the leave session on the popup
    assert.ok(($("#mySessionId1").length == true), "Session has appeared in the list of current user sessions");
    $("#mySessionId1").click();
    $("#leaveSession").click();

    //Check session was correctly left
    currentUserSessions = sessions.retrieveCurrentUserSessions();
    assert.ok(currentUserSessions, "Current user sessions initialised");
    assert.equals(currentUserSessions.length, 0, "No sessions present in list");
});

//Using Sessions/Session/User classes to test leaving a session
QUnit.test("Session #7 - Session left via object calls", function (assert) {
    //Create required objects
    var user = new user("ShaunTest");
    var sessions = new Sessions(user);

    //Test initial object state
    assert.ok(user, "Session owner user successfully created");
    assert.ok(sessions, "Sessions object created successfully");
    assert.ok(!sessions.getAvailableSessions(), "Newly created sessions object does not have any available sessions list");

    //Check that no sessions are available to start with
    availableSessions = sessions.retrieveAvailableSessions();
    assert.ok(availableSession, "Available sessions initialised");
    assert.equals(availableSessions.length, 0, "No sessions should be available");

    //Make user create a session so he can leave
    createSession(testSessionName, testSessionBook, user);

    //Check that test session has been added so user can leave
    var currentUserSessions = sessions.retrieveCurrentUserSessions();
    assert.ok(currentUserSessions, "Current user sessions initialised");
    assert.equals(currentUserSessions.length, 1, "Newly created session now present in list");

    //Leave session
    leaveSession(user, session);

    //Check session was correctly left
    currentUserSessions = sessions.retrieveAvailableSessions();
    assert.ok(currentUserSessions, "Current user sessions initialised");
    assert.equals(currentUserSessions.length, 0, "No sessions present in list");
});

//Helper function for creating a session - Used in multiple tests as to improve code reuse
var createSession = function(sessionName, sessionBook, owner){
    var testSession = new Session();
    testSession.name = sessionName;
    testSession.book = new Book(sessionBook);
    testSession.owner = owner;

    //Create the session
    testSession.create();
};

//Helper function for leaving a session - Used in multiple test as to imrpove code reuse
var leaveSession = function(user, session){
    user.leaveSession(session);
};