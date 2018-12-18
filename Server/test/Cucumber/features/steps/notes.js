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

var sampleSessionName = "My Test Session";
var sampleUsername = "ShaunTest";
var samplePageNum = 0;
var sampleNoteDetails = "This is an example note used in Cucumber-js tests";

//1) Scenario: View all notes for a session # Server\test\Cucumber\features\notes.feature:5
Given('that I am in the session I want to view the notes of', function() {
    // Create a session using a dummy user so that there's at least 1 available session
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
    assert.ok(!result.err, "No error should be returned")
    assert.ok(result.success, "Session should have successfully been created");

    //Retrieve ID of newly created session
    this.sessionId = result.result._id;

    //Add a note to our dummy session
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
    assert.ok(!result.err, "No error should be returned")
    assert.ok(result.success, "The note should have successfully been added to the session");
});

When('I ask to see all of the notes for that session', function() {
    var response = request("POST", "http://localhost:9001/notes/getallsessionnotes", {
        json: {
            sessionId: this.sessionId,
            userId: this.clientId
        }
    });
    var result = JSON.parse(response.getBody("utf8"));

    this.getAllNotesResult = result;
});

Then('I should be shown the notes for that session', function() {
    var result = this.getAllNotesResult;

    assert.ok(result, "The server should have sent back a response");
    assert.ok(!result.err, "No error should be returned")
    assert.ok(result.success, "The  should have successfully been created");

    assert.ok(result.result.notes, "Notes should have been returned to us");
    assert.equal(result.result.notes.length, 1, "1 note should have been returned");
    assert.equal(result.result.notes[0].user, sampleUsername, "The first note should have the correct username set");
    assert.equal(result.result.notes[0].note, sampleNoteDetails, "The first note should have the correct note details set");
    assert.equal(result.result.notes[0].pageNum, samplePageNum, "The first note should have the correct pageNum set");
});


//2) Scenario: Add a new note to a session # Server\test\Cucumber\features\notes.feature:10
Given('that I am in the session I want to add a note to', function() {
    // Create a session using a dummy user so that there's at least 1 available session
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
    assert.ok(!result.err, "No error should be returned")
    assert.ok(result.success, "Session should have successfully been created");

    //Set the sessionId as the result from this
    this.sessionId = result.result._id;
});

Given('I have chosen a page number to add my note to', function() {
    //Use the samplePageNum as our pageNum
    this.pageNum = samplePageNum;
});

Given('I have chosen what my note will say', function() {
    //Use the sampleNoteDetails as out noteDetails
    this.noteDetails = sampleNoteDetails;
});

Then('when I try to add a note', function() {
    //Add a note to our dummy session
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

Then('my note should be created', function() {
    var result = this.noteResult;
    //Check that the noteResult was successful
    assert.ok(result, "The server should have sent back a response");
    assert.ok(!result.err, "No error should be returned")
    assert.ok(result.success, "The note should have successfully been created");

    //Check the the returned contents is correct
    assert.ok(result.result.notes, "The list of notes should have been returned");
    assert.equal(result.result.notes.length, 1, "There should be 1 note in the list");
});