const {
    Given,
    When,
    Then
} = require("cucumber");
var assert = require("assert");
var request = require("sync-request");

var sampleSessionName = "My Test Session";
var sampleUsername = "ShaunTest";
var samplePageNum = 0;
var sampleNoteDetails = "This is an example note used in Cucumber-js tests";
var world;

//Scenario: View all notes for a session
Given("that I am in the session I want to view the notes of", function() {
    // Create a session so that there's at least 1 available session
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

    //Retrieve ID of newly created session
    this.sessionId = result.result._id;

    //Add a note to our session
    response = request("POST", "http://localhost:9001/notes/addnewnote", {
        json: {
            sessionId: this.sessionId,
            userId: this.clientId,
            note: sampleNoteDetails,
            pageNum: samplePageNum
        }
    });
    result = JSON.parse(response.getBody("utf8"));

    assert.ok(result, "The server should have sent back a response");
    assert.ok(!result.err, "No error should be returned");
    assert.ok(result.success, "The note should have successfully been added to the session");
});

When("I ask to see all of the notes for that session", function() {
    //Get all of the notes for the session we just joined
    var response = request("POST", "http://localhost:9001/notes/getallsessionnotes", {
        json: {
            sessionId: this.sessionId,
            userId: this.clientId
        }
    });
    var result = JSON.parse(response.getBody("utf8"));

    this.getAllNotesResult = result;
});

Then("I should be shown the notes for that session", function() {
    //Check the result of the previous getallsessionnotes request is as expected
    var result = this.getAllNotesResult;

    assert.ok(result, "The server should have sent back a response");
    assert.ok(!result.err, "No error should be returned");
    assert.ok(result.success, "The  should have successfully been created");

    assert.ok(result.result.notes, "Notes should have been returned to us");
    assert.equal(result.result.notes.length, 1, "1 note should have been returned");
    assert.equal(result.result.notes[0].user, sampleUsername, "The first note should have the correct username set");
    assert.equal(result.result.notes[0].note, sampleNoteDetails, "The first note should have the correct note details set");
    assert.equal(result.result.notes[0].pageNum, samplePageNum, "The first note should have the correct pageNum set");
});


//Scenario: Add a new note to a session
Given("that I am in the session I want to add a note to", function() {
    // Create a session so that there's at least 1 available session
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

    //Set the sessionId as the result from this
    this.sessionId = result.result._id;
});

Given("I have chosen a page number to add my note to", function() {
    //Use the samplePageNum as our pageNum
    this.pageNum = samplePageNum;
});

Given("I have chosen what my note will say", function() {
    //Use the sampleNoteDetails as out noteDetails
    this.noteDetails = sampleNoteDetails;
});

When("when I try to add a note", function(callback) {
    //Set up the websocket on message here 
    //This has to be done here as the websocket should receive a message about the note
    world = this;
    this.websocketConnection.on("message", function(message) {
        var messageData = JSON.parse(message.utf8Data);
        switch (messageData.type) {
        // Message received containing newly created note (sent to all users in the session)
            case "newnoteadded":
                world.newNoteId = messageData.note._id;
                callback();
                break;
            default:
                break;
        }
    });

    //Add a note to our session
    var response = request("POST", "http://localhost:9001/notes/addnewnote", {
        json: {
            sessionId: this.sessionId,
            userId: this.clientId,
            note: this.noteDetails,
            pageNum: this.pageNum
        }
    });
    var result = JSON.parse(response.getBody("utf8"));

    this.noteResult = result;
});

Then("my note should be created", function() {
    var result = this.noteResult;
    //Check that the noteResult was successful
    assert.ok(result, "The server should have sent back a response");
    assert.ok(!result.err, "No error should be returned");
    assert.ok(result.success, "The note should have successfully been created");

    //Check the the returned contents is correct
    assert.equal(result.result.user, sampleUsername, "The returned note should havethe correct username");
    assert.equal(result.result.note, this.noteDetails, "The returned note should have the correct noteDetails");
    assert.equal(result.result.pageNum, this.pageNum, "The returned note should have the correct page number");
});

Then("I should be informed that it was created", function() {
    //Check that the value was correctly set by our websocket on message
    assert.ok(this.newNoteId, "Our websocket should have told us about our new note being created");
});


//Scenario: Delete a note in a session
Given("that I am in the session I want to remove a note from", function() {
    // Create a session so that there's at least 1 available session
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

    //Set the sessionId as the result from this
    this.sessionId = result.result._id;
});

Given("that session has a note for me to delete", function() {
    //Add a note to our session
    var response = request("POST", "http://localhost:9001/notes/addnewnote", {
        json: {
            sessionId: this.sessionId,
            userId: this.clientId,
            note: sampleNoteDetails,
            pageNum: samplePageNum
        }
    });
    var result = JSON.parse(response.getBody("utf8"));

    //Check that the noteResult was successful
    assert.ok(result, "The server should have sent back a response");
    assert.ok(!result.err, "No error should be returned");
    assert.ok(result.success, "The note should have successfully been created");

    //Check the the returned contents is correct

    //Check the the returned contents is correct
    assert.equal(result.result.user, sampleUsername, "The returned note should havethe correct username");
    assert.equal(result.result.note, sampleNoteDetails, "The returned note should have the correct noteDetails");
    assert.equal(result.result.pageNum, samplePageNum, "The returned note should have the correct page number");

    this.createNoteResult = result;
});

Given("I have selected the note I want to delete", function() {
    this.noteToDeleteId = this.createNoteResult.result._id;
});

When("when I try to delete the note", function(callback) {
    //Set up the websocket on message here 
    //This has to be done here as the websocket should receive a message about the note
    world = this;
    this.websocketConnection.on("message", function(message) {
        var messageData = JSON.parse(message.utf8Data);
        switch (messageData.type) {
        // Message received containing newly created note (sent to all users in the session)
            case "noteremoved":
                world.removedNoteId = messageData.noteId;
                callback();
                break;
            default:
                break;
        }
    });

    //Add a note to our session
    var response = request("POST", "http://localhost:9001/notes/deletenote", {
        json: {
            sessionId: this.sessionId,
            userId: this.clientId,
            noteId: this.noteToDeleteId
        }
    });
    var result = JSON.parse(response.getBody("utf8"));

    this.deleteNoteResult = result;
});

Then("the note should be deleted", function() {
    var result = this.deleteNoteResult;
    //Check that the noteResult was successful
    assert.ok(result, "The server should have sent back a response");
    assert.ok(!result.err, "No error should be returned");
    assert.ok(result.success, "The note should have successfully been created");

    //Check the the returned contents is correct
    assert.ok(result.result.removed, "The server should respond saying the note has been removed");
});

Then("I should be informed that it was deleted", function() {
    //Check that the result returned by the websocket is correct
    assert.ok(this.removedNoteId, "The websocket should have received a message regarding the note being deleted");
    assert.equal(this.removedNoteId, this.noteToDeleteId, "The note that was deleted should have the same ID as the message the web socket received");
});