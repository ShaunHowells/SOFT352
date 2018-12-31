const {
    Given,
    When,
    Then
} = require("cucumber");
var assert = require("assert");
var request = require("sync-request");

var sampleSessionName = "My Test Session";
var sampleUsername = "ShaunTest";
var sampleJoinUsername = "Johns";
var sampleChatMessage = "This is a chat messages used during testing with Cucumber-js";

var world;


//Scenario: Send chat message
Given("that I am in a session with multiple users", function() {
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

    assert.ok(result, "The server should have sent back a response");
    assert.ok(!result.err, "No error should be returned");
    assert.ok(result.success, "Session should have successfully been created");
    assert.ok(result.result._id, "The session ID should have been returned");

    this.sessionId = result.result._id;

    //Join the session with another user so that we have multiple users in one session
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
Given("I have input my chat message", function() {
    //Set our message as sampleChatMessage
    this.message = sampleChatMessage;
});

When("I send a chat message", function(callback) {
    //Set up the websocket on message here 
    //This has to be done here as the websocket should receive a chat message
    world = this;
    this.extraWebsocketConnection.on("message", function(message) {
        var messageData = JSON.parse(message.utf8Data);
        switch (messageData.type) {
        // Message received contains the data about the incoming chat message
            case "chatmessagereceived":
                world.receivedChatMessage = messageData.chatMessage;
                callback();
                break;
            default:
                break;
        }
    });
    var response = request("POST", "http://localhost:9001/chat/sendchatmessage", {
        json: {
            sessionId: this.sessionId,
            userId: this.clientId,
            message: this.message

        }
    });
    var result = JSON.parse(response.getBody("utf8"));

    assert.ok(result, "The server should have sent back a response");
    assert.ok(!result.err, "No error should be returned");
    assert.ok(result.success, "The chat message should have successfully sent");
});

Then("the other users in the session should receive that chat message", function() {
    //Check that the message as received correctly
    assert.ok(this.receivedChatMessage, "The chat message should have been received by the other user(s) in the session");
    assert.equal(this.receivedChatMessage.user, sampleUsername, "The chat message should contain the name of the user who sent the message");
    assert.equal(this.receivedChatMessage.message, this.message, "The chat message should contain the message that was input by the user who sent the message");
});