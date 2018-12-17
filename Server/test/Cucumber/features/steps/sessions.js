const {
    BeforeAll,
    Before,
    After,
    Given,
    When,
    Then
} = require("cucumber");
var assert = require("assert");
var request = require("sync-request");

var WebSocket = require("../../../../src/node_modules/websocket").client;

var sampleSessionName = "My Test Session";
var sampleBookId = "5c152300e70cc20a1032c994";
var sampleUsername = "ShaunTest";

var world;
Before(function(testCase, callback) {
    world = this;
    world.websocket = new WebSocket();
    world.websocket.on("connect", function(connection) {
        world.websocketConnection = connection;
        connection.on("message", function(message) {
            var messageData = JSON.parse(message.utf8Data);
            switch (messageData.type) {
                // Message received containing our unique client id
                case "connected":
                    world.clientId = messageData.clientId;
                    callback();
                    break;
                default:
                    break;
            }
        });
    });
    world.websocket.connect("ws://localhost:9001");
});

After(function() {
    world.websocketConnection.close();
    world.websocket = null;
});

After({
    tags: "@AdditionalUserRequired"
}, function() {
    world.extraWebsocketConnection.close();
    world.extraWebsocket = null;
})

// var this.clientId; = "1q2w3e-4r5t";
//1) Scenario: Viewing all available session # features\sessions.feature:5
Given('there are available sessions', function() {
    // Create a session using a dummy user so that there's at least 1 available session
    var response = request("POST", "http://localhost:9001/sessions/createsession", {
        json: {
            sessionName: sampleSessionName,
            bookId: sampleBookId,
            user: {
                userId: this.clientId,
                username: sampleUsername
            }
        }
    });
    var result = JSON.parse(response.getBody("utf8"));

    assert(result, "The server should have sent back a response");
    assert(!result.err, "No error should be returned")
    assert(result.success, "Session should have successfully been created");
});

When('I ask to see all available sessions', function() {
    //Query the server to return all available sessions
    var response = request("POST", "http://localhost:9001/sessions/getallsessions", );
    var result = JSON.parse(response.getBody("utf8"));
    this.availableSessionResult = result
});

Then('I should be shown the available sessions', function() {
    //Check that that the returned result contains the list of available sessions
    assert(this.availableSessionResult, "The server should have sent back a response");
    assert(!this.availableSessionResult.err, "No error should be returned")
    assert(this.availableSessionResult.success, "Sessions should have successfully retrieved")

    assert.ok(this.availableSessionResult.result.length >= 1, "At least one session should have been retrieved");

    //Check that all of the expected keys exist - Don't worry about their values, we only care that they've been returned
    var firstSession = this.availableSessionResult.result[0];
    assert.ok(firstSession._id, "The _id should be returned");
    assert.ok(firstSession.name, "The name should be returned");
    assert.ok(firstSession.owner, "The owner should be returned");
    assert.ok(firstSession.currentPageNum != null, "The currentPageNum should be returned"); //currentPageNum could be 0, so we need a more truthy check
    assert.ok(firstSession.currentBook, "The currentBook should be returned");
    assert.ok(firstSession.users, "The users should be returned");
});


//2) Scenario: Creating a session# features\ sessions.feature: 10 ?
Given('I have supplied a name for the session', function() {
    //Use the sampleSessionName as our sessionName
    this.sessionName = sampleSessionName;
});

Given('I have chosen a book', function() {
    //Use the sampleBookId as our bookId
    this.bookId = sampleBookId;
});

Given('I have a user id', function() {
    //Use the this.clientId; as our user id
    this.userId = this.clientId;;
});

Given('I have supplied a username', function() {
    //Use the sampleUsername as our username
    this.username = sampleUsername
});

When('I try to create a session', function() {
    // Write code here that turns the phrase above into concrete actions
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

    assert(result, "The server should have sent back a response");
    this.sessionResult = result
});

Then('my session should be created', function() {
    // Write code here that turns the phrase above into concrete actions
    assert(!this.sessionResult.err, "No error should be returned")
    assert(this.sessionResult.success, "Session should have successfully been created");

});

Then('I should be joined to that session', function() {
    // Write code here that turns the phrase above into concrete actions
    var users = this.sessionResult.result.users;

    assert.equal(users.length, 1, "1 user should be present in the session");
    assert.equal(users[0].user_id, this.clientId, "Our user should be in the current session");
});



//3) Scenario: Joining an available session# features\ sessions.feature: 17 ?
var sampleJoinUserId = "0o9i8u-7y6t"
var sampleJoinUsername = "JoinUser";
Given('there are available sessions to join', function() {
    // Create a session using a dummy user so that there's at least 1 available session to join
    var response = request("POST", "http://localhost:9001/sessions/createsession", {
        json: {
            sessionName: sampleSessionName,
            bookId: sampleBookId,
            user: {
                userId: this.clientId,
                username: sampleUsername
            }
        }
    });
    var result = JSON.parse(response.getBody("utf8"));

    assert(result, "The server should have sent back a response");
    assert(!result.err, "No error should be returned")
    assert(result.success, "Session should have successfully been created");
    assert(result.result._id, "The session Id should have been returned");
    this.sessionId = result.result._id;
});

Given('I have a user id to join the session with', function(callback) {
    //Connect to the server to get another userId to join the session with
    world = this;
    world.extraWebsocket = new WebSocket();
    world.extraWebsocket.on("connect", function(connection) {
        world.extraWebsocketConnection = connection;
        connection.on("message", function(message) {
            var messageData = JSON.parse(message.utf8Data);
            switch (messageData.type) {
                // Message received containing our unique client id
                case "connected":
                    world.joinUserId = messageData.clientId;
                    callback();
                    break;
                default:
                    break;
            }
        });
    });
    world.extraWebsocket.connect("ws://localhost:9001");
});

Given('I have supplied a username to join the session with', function() {
    //Use sampleJoinUsername as our username
    this.joinUsername = sampleJoinUsername;
});

When('I try to join a session', function() {
    // Join the previously created session with another user
    // Create a session using a dummy user so that there's at least 1 available session to join
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

Then('I should be added to the session', function() {
    //Check that we were added to the session
    assert(this.joinSessionResult, "The server should have sent back a response");
    assert(!this.joinSessionResult.err, "No error should be returned")
    assert(this.joinSessionResult.success, "Session should have successfully been joined");

    var users = this.joinSessionResult.result.users;

    var foundUser = false;
    for (var user in users) {
        if (users[user].user_id == this.joinUserId) {
            foundUser = true;
            break;
        }
    }
    assert.ok(foundUser, "Our user who joined the session should be found in that sessions list of users")
});

Then('given information about the session', function() {
    var foundSession = this.joinSessionResult.result;
    assert.ok(foundSession._id, "The _id should be returned");
    assert.ok(foundSession.name, "The name should be returned");
    assert.ok(foundSession.owner, "The owner should be returned");
    assert.ok(foundSession.currentPageNum != null, "The currentPageNum should be returned"); //currentPageNum could be 0, so we need a more truthy check
    assert.ok(foundSession.currentBook, "The currentBook should be returned");
    assert.ok(foundSession.users, "The users should be returned");
});


//4) Scenario: Leaving a session# features\ sessions.feature: 23 ?
Given('that I am in a session', function() {
    // Create a session using a dummy user so that there's at least 1 available session to join
    //I should automatically be joined to this session
    var response = request("POST", "http://localhost:9001/sessions/createsession", {
        json: {
            sessionName: sampleSessionName,
            bookId: sampleBookId,
            user: {
                userId: this.clientId,
                username: sampleUsername
            }
        }
    });
    var result = JSON.parse(response.getBody("utf8"));

    assert(result, "The server should have sent back a response");
    assert(!result.err, "No error should be returned")
    assert(result.success, "Session should have successfully been created");
    assert(result.result._id, "The session Id should have been returned");
    this.sessionId = result.result._id;
});

When('I try to leave the session', function() {
    // Leave the previously created session
    var response = request("POST", "http://localhost:9001/sessions/leavesession", {
        json: {
            sessionId: this.sessionId,
            userId: this.clientId
        }
    });
    var result = JSON.parse(response.getBody("utf8"));
    assert(result, "The server should have sent back a response");
    assert(!result.err, "No error should be returned")
    assert(result.success, "Session should have successfully been left");
    this.leaveSessionResult = result;
});

Then('I should removed from the session', function() {
    //Check that our user isn't in the session anymore
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