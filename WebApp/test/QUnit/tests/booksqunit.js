//Sample books for use in Sessions tests
var sampleBookList = [{
    "_id": "5bf59ade4cb1550530740989",
    "title": "Shaun's Test Book",
    "__v": 0
}];

/**
 * The 'Books' module contains all of the tests directly relating to the use of Books. This does not test the functionality of the books themselves, only show the UI interactions with them
 * These tests use sample data that is representative of actual books. The sample data is used instead querying the database.
 */
QUnit.module("Books");


/**
 * The 'Books' module contains all of the tests directly relating to the use of Books. This does not test the functionality of the books themselves, only show the UI interactions with them
 * These tests use sample data that is representative of actual books. The sample data is used instead querying the database.
 */
QUnit.test("Display list of books in 'Create a new session' book list", function (assert) {
    //STORE PREVIOUS VALUES
    //Get the currently active tab heading
    var currentlyActiveTab = angular.element("#sessionTabList").find("li .active");
    //Gets the current bookList
    var previousBookList = CollabBookReader.getBooks().getBookList();
    //Get the current currentUserSession
    var previousCurrentUserSession = CollabBookReader.getSessions().getCurrentUserSession();

    //Get Angular scope for the the book list
    var bookListCtrlScope = angular.element("#createNewSessionBook").scope();
    //Get Angular scope for the 'My Session'
    var currentUserSessionCtrlScope = angular.element("#currentUserSession").scope();

    //Click 'My Session' tab heading
    angular.element("#currentUserSessionTabHeading").click();
    //Set the currentUserSession to empty to ensure we have the 'Create a new session' button
    CollabBookReader.getSessions().setCurrentUserSession({});
    //Manually call $apply
    //The functions themselves use $applyAsync so we need to guarantee that the values have been updated before we check the values
    currentUserSessionCtrlScope.$apply();
    //Display the 'Create a new session' popup
    angular.element("#createNewSession").click();

    CollabBookReader.getBooks().setBookList(sampleBookList);
    //Manually call .$apply() as it normally uses $applyAsync()
    bookListCtrlScope.$apply();

    var updatedBookListLength = sampleBookList.length;
    //Check that bookListCtrlScope is correctly updated to have the correct number of books
    assert.equal(bookListCtrlScope.bookList.length, updatedBookListLength, updatedBookListLength + " book should be in the bookList in the $scope");
    //Check that the UI has been updated to display the correct number of books - Using updatedBookListLength + 1 because 1 of the options will be "Please select a value" which isn't included in the book list
    assert.equal(angular.element("#createNewSessionBook").children("option").length, (updatedBookListLength + 1), (updatedBookListLength + 1) + " books should be in the list (with 1 being an 'unselected' option)");

    //Close 'Create a new sesson' popup
    angular.element("#createNewSessionModalClose").click();

    //RESET TO PREVIOUS VALUES
    //Set currentUserSession back to previous value
    CollabBookReader.getSessions().setCurrentUserSession(previousCurrentUserSession);
    //Set the bookList to previous value
    CollabBookReader.getBooks().setBookList(previousBookList);
    //Click the previously selected tab heading
    currentlyActiveTab.click();
});