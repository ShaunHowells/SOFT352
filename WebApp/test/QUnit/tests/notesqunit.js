//Sample chat messatges for use in Chat tests
var sampleNote1 = {
    "user": "ShaunH",
    "pageNum": 0,
    "message": "Sample 1"
};

var sampleNote2 = {
    "user": "JohnS",
    "pageNum": 1,
    "message": "Sample 2"
}

var sampleNotes = [{
    "user": "Tim",
    "page": 0,
    "message": "Message 1"
}, {
    "user": "Jim",
    "pageNum": 1,
    "message": "Message 2"
}];


var sampleBookPageForNotes = {
    "_id": "5bf59ade4cb1550530740989",
    "title": "Shaun's Test Book",
    "pageCount": 1,
    "currentPage": {
        "_id": "5bf59ade4cb155053074098a",
        "src": "../../../test/QUnit/resources/testBookPage.png",
        "pageNum": 0
    }
};



/**
 * The 'Notes' module contains all of the tests directly relating to the use of Notes. This does not test the functionality of Notes itself, only show the UI interactions with it
 * These tests use sample data that is representative of actual notes. The sample data is used insted of needing multiple users each connected to the server via websockets.
 */
QUnit.module("Notes");

/**
 * Display the set of notes
 */
QUnit.test("Set list of Notes", function(assert) {
    //STORE PREVIOUS VALUES
    //Gets the current notes
    var previousNotes = CollabBookReader.getNotes().getNoteList();
    //Get current bookPage
    var previousCurrentPage = CollabBookReader.getBooks().getCurrentBookPage();

    //Get Angular scope for the the notes
    var notesCtrl = angular.element("#notesArea").scope();
    //Get Angular scope for the the currentPage
    var bookPageCtrlScope = angular.element("#bookPageCarousel").scope();

    //Set current page to sample page so we have a page to test displaying notes for only our current page
    CollabBookReader.getBooks().setCurrentBookPage(sampleBookPage);
    //Manually call .$apply() as it normally uses $applyAsync()
    bookPageCtrlScope.$apply();

    //Set notes to our sample set
    CollabBookReader.getNotes().setNoteList(sampleNotes);
    //Manually call .$apply() as it normally uses $applyAsync()
    notesCtrl.$apply();

    //Find how many pages in our sample page are in our currentBookPage
    var currentPageNotesLength = 0;
    for (var i = 0; i < sampleNotes; i++) {
        if (sampleNotes[i].page == sampleBookPage.currentPage.pageNum) {
            currentPageNotesLength++;
        }
    }

    //Check values of the Angular scope has been correctly updated
    var notes = notesCtrl.noteList;
    assert.equal(notes.length, sampleNotes.length, sampleNotes.length + " notes should be in the notes list");
    //Check that the UI reflects the changes to the scope
    assert.equal(angular.element("#allPagesNotesBody").children("div").length, notes.length, notes.length + " notes should be displayed in the notes list");
    assert.equal(angular.element("#currentPageNotesBody").children("div").length, currentPageNotesLength, currentPageNotesLength + " notes should be displayed in the notes list");

    //RESET TO PREVIOUS VALUES
    //Set the currentBookPage to previous value
    CollabBookReader.getBooks().setCurrentBookPage(previousCurrentPage);
    //Set the notes to previous value
    CollabBookReader.getNotes().setNoteList(previousNotes);
});

/**
 * Remove all notes
 */
QUnit.test("Clear list of Notes", function(assert) {
    //STORE PREVIOUS VALUES
    //Gets the current notes
    var previousNotes = CollabBookReader.getNotes().getNoteList();

    //Get Angular scope for the the notes
    var notesCtrl = angular.element("#notesArea").scope();

    //Set notes to our sample list (So we have notes to remove)
    CollabBookReader.getNotes().setNoteList(sampleChatMessages);
    //Manually call .$apply() as it normally uses $applyAsync()
    notesCtrl.$apply();

    //Remove all notes
    CollabBookReader.getNotes().removeAllNotes();

    //Check values of the Angular scope has been correctly updated
    var notes = notesCtrl.noteList;
    assert.equal(notes.length, 0, "0 notes should be in the notes list");
    //Check that the UI reflects the changes to the scope
    assert.equal(angular.element("#allPagesNotesBody").children("div").length, 0, "0 notes should be displayed in the notes list ");

    //RESET TO PREVIOUS VALUES
    //Set the notes to previous value
    CollabBookReader.getNotes().setNoteList(previousNotes);
});

/**
 * Add a note to the list
 */
QUnit.test("Add note to list of Notes", function(assert) {
    //STORE PREVIOUS VALUES
    //Gets the current notes
    var previousNotes = CollabBookReader.getNotes().getNoteList();
    //Get current bookPage
    var previousCurrentPage = CollabBookReader.getBooks().getCurrentBookPage();

    //Get Angular scope for the the notes
    var notesCtrl = angular.element("#notesArea").scope();
    //Get Angular scope for the the currentPage
    var bookPageCtrlScope = angular.element("#bookPageCarousel").scope();

    //Remove all notes (to ensure that we start from 0)
    CollabBookReader.getNotes().removeAllNotes();
    //Manually call .$apply() as it normally uses $applyAsync()
    notesCtrl.$apply();

    //Set current page to sample page so we have a page to test displaying notes for only our current page
    CollabBookReader.getBooks().setCurrentBookPage(sampleBookPage);
    //Manually call .$apply() as it normally uses $applyAsync()
    bookPageCtrlScope.$apply();

    CollabBookReader.getNotes().addNote(sampleNote1);
    //Manually call .$apply() as it normally uses $applyAsync()
    notesCtrl.$apply();

    //Check values of the Angular scope have been correctly updated
    var notes = notesCtrl.noteList;
    assert.equal(notes.length, 1, "1 note should be in the notes list");
    assert.equal(angular.element("#allPagesNotesBody").children("div").length, 1, "1 note should be displayed in the all pages notes list");
    assert.equal(angular.element("#currentPageNotesBody").children("div").length, 1, "1 note should be displayed in the current page notes list");

    CollabBookReader.getNotes().addNote(sampleNote2);
    //Manually call .$apply() as it normally uses $applyAsync()
    notesCtrl.$apply();

    //Check values of the Angular scope have been correctly updated
    notes = notesCtrl.noteList;
    assert.equal(notes.length, 2, "2 note should be in the notes list");
    assert.equal(angular.element("#allPagesNotesBody").children("div").length, 2, "2 note should be displayed in the notes list");
    assert.equal(angular.element("#currentPageNotesBody").children("div").length, 1, "1 note should be displayed in the current page notes list");

    //RESET TO PREVIOUS VALUES
    //Set the currentBookPage to previous value
    CollabBookReader.getBooks().setCurrentBookPage(previousCurrentPage);
    //Set the notes to previous value
    CollabBookReader.getNotes().setNoteList(previousNotes);
});

/**
 * Display 'Add a note' popup - Test that clicking 'Add a note' button in the 'Notes' tab content shows the modal popup
 */
QUnit.test("Display 'Add a note' popup", function(assert) {
    //STORE PREVIOUS VALUES
    //Get the currently active tab heading
    var currentlyActiveTab = angular.element("#chatNotesTabList").find("li .active");
    //Get current bookPage
    var previousCurrentPage = CollabBookReader.getBooks().getCurrentBookPage();

    //Get Angular scope for the the currentPage
    var bookPageCtrlScope = angular.element("#bookPageCarousel").scope();

    //Click Notes tab heading
    angular.element("#notesHeading").click();

    //Set current page to sample page so that the Notes tab content is shown
    CollabBookReader.getBooks().setCurrentBookPage(sampleBookPage);
    //Manually call .$apply() as it normally uses $applyAsync()
    bookPageCtrlScope.$apply();

    //Check that Add a Note button is visible (only visible when the bookPage is set)
    assert.ok(angular.element("#createNewNote").is(":visible"), "When a bookPage is set, then the 'Add a note' button should be visible in the notes tab");

    //Click the 'Add a note' button
    angular.element("#createNewNote").click();

    //Check that the 'Add a note' modal popup is displayed
    assert.ok(angular.element("#createNewNoteModal").is(":visible"), "'Add a note' popup is currently being displayed");

    //Check that the values of the user inputs are empty when displaying the 'Add a note' popup
    assert.equal(angular.element("#createNewNotePageNum").val(), "", "Page Num should be empty");
    assert.equal(angular.element("#createNewNoteDetails").val(), "", "Note details should be empty");

    //Set values in 'Add a note' popup
    angular.element("#createNewNotePageNum").val("0");
    angular.element("#createNewNoteDetails").val("This is a note used for testing");

    //Close 'Add a note' popup
    angular.element("#createNewNoteModalClose").click();
    //Check that the 'Add a note' popup is no longer visible
    assert.ok(!angular.element("#createNewNoteModal").is(":visible"), "'Add a note' popup should now be hidden");

    //Reopen 'Add a note' popup to check that the values have been reset
    angular.element("#createNewNote").click();
    assert.equal(angular.element("#createNewNotePageNum").val(), "", "Page Num should have been reset after re-opening the popup");
    assert.equal(angular.element("#createNewNoteDetails").val(), "", "Note Details should be have been reset after opening the popup");

    //Close 'Add a note' popup
    angular.element("#createNewNoteModalClose").click();

    //RESET TO PREVIOUS VALUES
    //Set currentUserSession back to previous value
    CollabBookReader.getBooks().setCurrentBookPage(previousCurrentPage);
    //Click the previously selected tab heading
    currentlyActiveTab.click();
});