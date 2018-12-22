const {
    Given,
    When,
    Then
} = require("cucumber");
var assert = require("assert");
var request = require("sync-request");
var WebSocket = require("../../../../src/node_modules/websocket").client;

var sampleSessionName = "My Test Session";
var sampleUsername = "ShaunTest";

var world;

//Scenario: Viewing all available session - Manual
Given("there are available sessions", function() {
    // Create a session so that at least one session is available
    var response = request("POST", "http://localhost:9001/sessions/createsession", {
        json: {
            sessionName: sampleSessionName,
            bookId: this.retrievedBookId,
            user: {
                userId: this.clientId,
                username: sampleUsername
            }
        }
    });
    var result = JSON.parse(response.getBody("utf8"));

    assert.ok(result, "The server should have sent back a response");
    assert.ok(!result.err, "No error should be returned");
    assert.ok(result.success, "Session should have successfully been created");
});

When("I ask to see all available sessions", function() {
    //Query the server to return all available sessions
    var response = request("POST", "http://localhost:9001/sessions/getallsessions");
    var result = JSON.parse(response.getBody("utf8"));
    this.availableSessionResult = result;
});

Then("I should be shown the available sessions", function() {
    //Check that that the returned result contains the list of available sessions
    assert.ok(this.availableSessionResult, "The server should have sent back a response");
    assert.ok(!this.availableSessionResult.err, "No error should be returned");
    assert.ok(this.availableSessionResult.success, "Sessions should have successfully retrieved");

    assert.ok(this.availableSessionResult.result.length >= 1, "At least one session should have been retrieved");

    //Check that all of the expected keys exist - Don"t worry about their values, we only care that they"ve been returned
    var firstSession = this.availableSessionResult.result[0];
    assert.ok(firstSession._id, "The _id should be returned");
    assert.ok(firstSession.name, "The name should be returned");
    assert.ok(firstSession.owner, "The owner should be returned");
    assert.ok(firstSession.currentPageNum != null, "The currentPageNum should be returned"); //currentPageNum could be 0, so we need a more truthy check
    assert.ok(firstSession.currentBook, "The currentBook should be returned");
});

// Scenario: Viewing all available sessions when first visiting
Given("that I have just arrived", function(callback) {
    //The websocket should be created when we first interact with the system
    //On load it should send a list of the available sessions
    world = this;
    var tempWebsocket = new WebSocket();
    tempWebsocket.on("connect", function(connection) {
        var tempWebsocketConnection = connection;
        tempWebsocketConnection.on("message", function(message) {
            var messageData = JSON.parse(message.utf8Data);
            switch (messageData.type) {
                // Message received containing our unique client id
                case "allsessions":
                    world.availableSessions = messageData.result;
                    //As we only want to check the initial values returned, then close the websocket after we get our required message
                    tempWebsocketConnection.close();
                    tempWebsocket = null;
                    callback();
                    break;
                default:
                    break;
            }
        });
    });
    tempWebsocket.connect("ws://localhost:9001");
});

Then("I should be shown all available sessions", function() {
    //Check that we received the list of available sessions
    assert.ok(this.availableSessions, "The websocket should have sent us the list of available sessions after connecting");
});


//Scenario: Creating a session
Given("I have supplied a name for the session", function() {
    //Use the sampleSessionName as our sessionName
    this.sessionName = sampleSessionName;
});

Given("I have chosen a book", function() {
    //Use the this.retrievedBookId as our bookId
    this.bookId = this.retrievedBookId;
});

Given("I have a user id", function() {
    //Use the this.clientId; as our user id
    this.userId = this.clientId;
});

Given("I have supplied a username", function() {
    //Use the sampleUsername as our username
    this.username = sampleUsername;
});

When("I try to create a session", function(callback) {
    //Set up the websocket on message here so we ensure we get the websocket message before continuing
    world = this;
    this.websocketConnection.on("message", function(message) {
        var messageData = JSON.parse(message.utf8Data);
        switch (messageData.type) {
            // Message received containing newly created session (sent to all users)
            case "newsessioncreated":
                world.newSessionId = messageData.result._id;
                callback();
                break;
            default:
                break;
        }
    });

    //Create a session
    var response = request("POST", "http://localhost:9001/sessions/createsession", {
        json: {
            sessionName: this.sessionName,
            bookId: this.bookId,
            user: {
                userId: this.userId,
                username: this.username
            }
        }
    });
    var result = JSON.parse(response.getBody("utf8"));

    assert.ok(result, "The server should have sent back a response");
    this.sessionResult = result;
});

Then("my session should be created", function() {
    //Check that the created session result is successful
    assert.ok(!this.sessionResult.err, "No error should be returned");
    assert.ok(this.sessionResult.success, "Session should have successfully been created");

});

Then("I should be informed my session was created", function() {
    //Check that the websocket received a message when the session was created
    assert.ok(this.newSessionId, "The websocket should have sent up information about the newly created session");
});

Then("I should be joined to that session", function() {
    // Write code here that turns the phrase above into concrete actions
    var users = this.sessionResult.result.users;
    assert.equal(users.length, 1, "1 user should be present in the session");
    assert.equal(users[0].user_id, this.clientId, "Our user should be in the current session");
});


//Scenario: Joining an available session
var sampleJoinUserId = "0o9i8u-7y6t";
var sampleJoinUsername = "JoinUser";
Given("there are available sessions to join", function(callback) {
    //Set up the websocket on message here 
    //This has been added here to ensure that we receive the websocket message about a user (us) joining a session
    //We need to receive the same message later on, so only continue once it has been received for the first time
    //This ensures we recieve the correct message later
    world = this;
    this.websocketConnection.on("message", function(message) {
        var messageData = JSON.parse(message.utf8Data);
        switch (messageData.type) {
            // Message received containing user who joined the session (in this case us)
            case "userjoinedsession":
                callback();
                break;
            default:
                break;
        }
    });

    // Create a session so that there"s at least 1 available session to join
    var response = request("POST", "http://localhost:9001/sessions/createsession", {
        json: {
            sessionName: sampleSessionName,
            bookId: this.retrievedBookId,
            user: {
                userId: this.clientId,
                username: sampleUsername
            }
        }
    });
    var result = JSON.parse(response.getBody("utf8"));

    assert.ok(result, "The server should have sent back a response");
    assert.ok(!result.err, "No error should be returned");
    assert.ok(result.success, "Session should have successfully been created");
    assert.ok(result.result._id, "The session Id should have been returned");
    this.sessionId = result.result._id;
});

Given("I have a user id to join the session with", function() {
    //Set our 2nd created user id as the id we want to join the session with
    this.joinUserId = this.extraClientId;
});

Given("I have supplied a username to join the session with", function() {
    //Use sampleJoinUsername as our username
    this.joinUsername = sampleJoinUsername;
});

When("I try to join a session", function(callback) {
    //Set up the websocket on message here so we ensure we get the websocket message before continuing
    world = this;
    this.websocketConnection.on("message", function(message) {
        var messageData = JSON.parse(message.utf8Data);
        switch (messageData.type) {
            // Message received containing user who joined the session (in this case us)
            case "userjoinedsession":
                world.joinSessionUser = messageData.user;
                callback();
                break;
            default:
                break;
        }
    });

    //Have our 2nd user join the session
    var response = request("POST", "http://localhost:9001/sessions/joinsession", {
        json: {
            sessionId: this.sessionId,
            user: {
                userId: this.joinUserId,
                username: this.joinUsername
            }
        }
    });
    var result = JSON.parse(response.getBody("utf8"));

    this.joinSessionResult = result;
});

Then("I should be added to the session", function() {
    //Check that we were added to the session
    assert.ok(this.joinSessionResult, "The server should have sent back a response");
    assert.ok(!this.joinSessionResult.err, "No error should be returned");
    assert.ok(this.joinSessionResult.success, "Session should have successfully been joined");

    var users = this.joinSessionResult.result.users;

    var foundUser = false;
    for (var user in users) {
        if (users[user].user_id == this.joinUserId) {
            foundUser = true;
            break;
        }
    }
    assert.ok(foundUser, "Our user who joined the session should be found in that sessions list of users");
});

Then("I should be informed that I was added to the session", function() {
    //Check that the user information is as expected
    assert.ok(this.joinSessionUser, "I should have been informed by the websocket that I have joined the session");
    assert.ok(this.joinSessionUser._id, "A unique ID should have been returned by the websocket");
    assert.equal(this.joinSessionUser.username, this.joinUsername, "The correct username should have been returned by the websocket");
});

Then("given information about the session", function() {
    //Check that the session information is as expected
    var foundSession = this.joinSessionResult.result;
    assert.ok(foundSession._id, "The _id should be returned");
    assert.ok(foundSession.name, "The name should be returned");
    assert.ok(foundSession.owner, "The owner should be returned");
    assert.ok(foundSession.currentPageNum != null, "The currentPageNum should be returned"); //currentPageNum could be 0, so we need a more truthy check
    assert.ok(foundSession.currentBook, "The currentBook should be returned");
    assert.ok(foundSession.users, "The users should be returned");
});


//Scenario: Leaving a session - 1 User
Given("that I am in a session by myself", function() {
    //Create a session
    var response = request("POST", "http://localhost:9001/sessions/createsession", {
        json: {
            sessionName: sampleSessionName,
            bookId: this.retrievedBookId,
            user: {
                userId: this.clientId,
                username: sampleUsername
            }
        }
    });
    var result = JSON.parse(response.getBody("utf8"));

    assert.ok(result, "The server should have sent back a response");
    assert.ok(!result.err, "No error should be returned");
    assert.ok(result.success, "Session should have successfully been created");
    assert.ok(result.result._id, "The session Id should have been returned");
    this.sessionId = result.result._id;
});

When("I try to leave the session", function(callback) {
    //Set up the websocket on message here so we ensure we get the websocket message before continuing
    world = this;
    this.websocketConnection.on("message", function(message) {
        var messageData = JSON.parse(message.utf8Data);
        switch (messageData.type) {
            // Message received containing delete session (sent to all users)
            case "sessionremoved":
                world.deletedSessionId = messageData.result.sessionId;
                callback();
                break;
            default:
                break;
        }
    });

    // Leave the previously created session
    var response = request("POST", "http://localhost:9001/sessions/leavesession", {
        json: {
            sessionId: this.sessionId,
            userId: this.clientId
        }
    });
    var result = JSON.parse(response.getBody("utf8"));
    assert.ok(result, "The server should have sent back a response");
    assert.ok(!result.err, "No error should be returned");
    assert.ok(result.success, "Session should have successfully been left");
    this.leaveSessionResult = result;
});

Then("I should removed from the session", function() {
    //Check that our user isn"t in the session anymore
    var users = this.leaveSessionResult.result.users;

    var foundUser = false;
    for (var user in users) {
        if (users[user].user_id == sampleJoinUserId) {
            foundUser = true;
            break;
        }
    }
    assert.ok(!foundUser, "The user who left the session shouldn't be in the session anymore");
});

Then("I should be informed that the session has closed", function() {
    //Check that the websocket received a messages about the session that was deleted
    assert.ok(this.deletedSessionId, "The websocket should have sent a message informing us/everyone of the deleted session");
});

//Scenario: Leaving a session - Multiple Users
Given("that I am in a session with at least one other user", function() {
    //Create a new session
    var response = request("POST", "http://localhost:9001/sessions/createsession", {
        json: {
            sessionName: sampleSessionName,
            bookId: this.retrievedBookId,
            user: {
                userId: this.clientId,
                username: sampleUsername
            }
        }
    });
    var result = JSON.parse(response.getBody("utf8"));

    assert.ok(result, "The server should have sent back a response");
    assert.ok(!result.err, "No error should be returned");
    assert.ok(result.success, "Session should have successfully been created");
    assert.ok(result.result._id, "The session Id should have been returned");

    this.sessionId = result.result._id;

    //Join the session with another user who we have multiple users in the session
    response = request("POST", "http://localhost:9001/sessions/joinsession", {
        json: {
            sessionId: this.sessionId,
            user: {
                userId: this.extraClientId,
                username: sampleJoinUsername
            }
        }
    });
    result = JSON.parse(response.getBody("utf8"));

    assert.ok(result, "The server should have sent back a response");
    assert.ok(!result.err, "No error should be returned");
    assert.ok(result.success, "Session should have successfully been joined");
});

When("I try to leave that session", function(callback) {
    //Set up the websocket on message here so we ensure we get the websocket message before continuing
    world = this;
    this.websocketConnection.on("message", function(message) {
        var messageData = JSON.parse(message.utf8Data);
        switch (messageData.type) {
            // Message received containing the user who left the session
            case "userleftsession":
                world.leftSessionUser = messageData.user;
                callback();
                break;
            default:
                break;
        }
    });

    // Leave the previously created session
    var response = request("POST", "http://localhost:9001/sessions/leavesession", {
        json: {
            sessionId: this.sessionId,
            userId: this.extraClientId
        }
    });
    var result = JSON.parse(response.getBody("utf8"));
    assert.ok(result, "The server should have sent back a response");
    assert.ok(!result.err, "No error should be returned");
    assert.ok(result.success, "Session should have successfully been left");
    this.leaveSessionResult = result;
});

Then("I should be removed from that session", function() {
    //Check that our user isn"t in the session anymore
    var users = this.leaveSessionResult.result.users;

    var foundUser = false;
    for (var user in users) {
        if (users[user].user_id == sampleJoinUserId) {
            foundUser = true;
            break;
        }
    }
    assert.ok(!foundUser, "The user who left the session shouldn't be in the session anymore");
});

Then("the others users in that session should be informed that I have left", function() {
    //Check the the websocket informed us of the user who left the session
    assert.ok(this.leftSessionUser, "The websockets should have informed the other users that I have left the session");
});

Then("the session should still be available", function() {
    //Query the server to return all available sessions - So we can check if the previously left session is still available
    var response = request("POST", "http://localhost:9001/sessions/getallsessions");
    var result = JSON.parse(response.getBody("utf8"));

    //Check if our session is still in the list of available sessions
    var sessionAvailable = false;
    for (var i = 0; i < result.result.length; i++) {
        if (result.result[i]._id == this.sessionId) {
            sessionAvailable = true;
            break;
        }
    }

    assert.ok(sessionAvailable, "The session we just left should still be available");
});

// Scenario: Change the page displayed in a session
var sampleNewPageNum = 1;
Given("that I am in the session I want to change the page of", function() {
    // Create a session
    var response = request("POST", "http://localhost:9001/sessions/createsession", {
        json: {
            sessionName: sampleSessionName,
            bookId: this.retrievedBookId,
            user: {
                userId: this.clientId,
                username: sampleUsername
            }
        }
    });
    var result = JSON.parse(response.getBody("utf8"));

    //Check the the response is successful
    assert.ok(result, "The server should have sent back a response");
    assert.ok(!result.err, "No error should be returned");
    assert.ok(result.success, "Session should have successfully been created");
    assert.ok(result.result._id, "The session Id should have been returned");
    this.sessionId = result.result._id;
});

Given("I have chosen what page I want to navigate to", function() {
    this.newPageNum = sampleNewPageNum;
});

When("I change the page displayed in the session", function(callback) {
    //Set up the websocket on message here 
    //This has to be done here as the websocket should receive a message about the session
    world = this;
    this.websocketConnection.on("message", function(message) {
        var messageData = JSON.parse(message.utf8Data);
        switch (messageData.type) {
            // Message received containing delete session (sent to all users)
            case "pagechanged":
                world.updatedPage = messageData.result;
                callback();
                break;
            default:
                break;
        }
    });

    //Set the current page of the session to our new page
    var response = request("POST", "http://localhost:9001/sessions/updatecurrentpage", {
        json: {
            sessionId: this.sessionId,
            pageNum: this.newPageNum,
            userId: this.clientId
        }
    });
    var result = JSON.parse(response.getBody("utf8"));

    assert.ok(result, "The server should have sent back a response");
    assert.ok(!result.err, "No error should be returned");
    assert.ok(result.success, "The page should have successfully been updated");
});

Then("I should be informed that the page displayed in the session has changed", function() {
    //Check that the message from the websocket was received correctly
    assert.ok(this.updatedPage, "The updated page details should have been received by the websocket");
    assert.equal(this.updatedPage.currentBook._id, this.retrievedBookId, "The id of the book should be the same as the id used when creating the session");
    assert.equal(this.updatedPage.currentPageNum, this.newPageNum, "The current page of the session should now be set to our newPageNum");
});