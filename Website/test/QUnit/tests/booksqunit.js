//Sample books for use in Books tests
var sampleBookList = [{
    "_id": "5c13c247aca73c02600de352",
    "title": "Shaun's Test Book",
    "pages": [{
        "_id": "5c13c247aca73c02600de353",
        "pageNum": 0,
        "contentType": "image/jpeg"
    }, {
        "_id": "5c13c247aca73c02600de354",
        "pageNum": 1,
        "contentType": "image/jpeg"
    }, {
        "_id": "5c13c247aca73c02600de355",
        "pageNum": 2,
        "contentType": "image/png"
    }],
    "pageCount": 3
}];

var sampleBookPage = {
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
 * The 'Books' module contains all of the tests directly relating to the use of Books. This does not test the functionality of the books themselves, only show the UI interactions with them
 * These tests use sample data that is representative of actual books. The sample data is used instead querying the database.
 */
QUnit.module("Books");


/**
 * Display the list of books in the 'Create a new session' books list
 */
QUnit.test("Display list of books in 'Create a new session' book list", function(assert) {
    //STORE PREVIOUS VALUES
    //Get the currently active tab heading
    var currentlyActiveTab = angular.element("#sessionTabList").find("li .active");
    //Gets the current bookList
    var previousBookList = Books.getBookList();
    //Get the current currentUserSession
    var previousCurrentUserSession = Sessions.getCurrentUserSession();

    //Get Angular scope for the the book list
    var bookListCtrlScope = angular.element("#createNewSessionBook").scope();
    //Get Angular scope for the 'My Session'
    var currentUserSessionCtrlScope = angular.element("#currentUserSession").scope();

    //Click 'My Session' tab heading
    angular.element("#currentUserSessionTabHeading").click();
    //Set the currentUserSession to empty to ensure we have the 'Create a new session' button
    Sessions.removeCurrentUserSession();
    //Manually call $apply
    //The functions themselves use $applyAsync so we need to guarantee that the values have been updated before we check the values
    currentUserSessionCtrlScope.$apply();
    //Display the 'Create a new session' popup
    angular.element("#createNewSession").click();

    Books.setBookList(sampleBookList);
    //Manually call .$apply() as it normally uses $applyAsync()
    bookListCtrlScope.$apply();

    var updatedBookListLength = sampleBookList.length;
    //Check that bookListCtrlScope is correctly updated to have the correct number of books
    assert.equal(bookListCtrlScope.bookList.length, updatedBookListLength, updatedBookListLength + " books should be in the bookList in the $scope");
    //Check that the UI has been updated to display the correct number of books - Using updatedBookListLength + 1 because 1 of the options will be "Please select a value" which isn't included in the book list
    assert.equal(angular.element("#createNewSessionBook").children("option").length, (updatedBookListLength + 1), (updatedBookListLength + 1) + " books should be in the list (with 1 being an 'unselected' option)");

    //Close 'Create a new sesson' popup
    angular.element("#createNewSessionModalClose").click();

    //RESET TO PREVIOUS VALUES
    //Set currentUserSession back to previous value
    Sessions.setCurrentUserSession(previousCurrentUserSession);
    //Set the bookList to previous value
    Books.setBookList(previousBookList);
    //Click the previously selected tab heading
    currentlyActiveTab.click();
});

/**
 * Update the currently displayed book page in the book carousel
 */
QUnit.test("Display book page in book carousel", function(assert) {
    //STORE PREVIOUS VALUES
    var previousCurrentPage = Books.getCurrentBookPage();

    //Get Angular scope for the the currentPage
    var bookPageCtrlScope = angular.element("#bookPageCarousel").scope();

    Books.setCurrentBookPage(sampleBookPage);
    //Manually call .$apply() as it normally uses $applyAsync()
    bookPageCtrlScope.$apply();

    //Check that the currentPage scope was correctly updated
    assert.equal(bookPageCtrlScope.currentBookPage.currentPage.src, sampleBookPage.currentPage.src, "The currentPage Angular scope has the correct image src");
    assert.equal(bookPageCtrlScope.currentBookPage.currentPage.pageNum, sampleBookPage.currentPage.pageNum, "The currentPage Angular scope has the correct page number");

    //Check that the UI has been udpated to display the correct image
    assert.equal(angular.element("#bookPageImage").attr("src"), sampleBookPage.currentPage.src, "Book Page Carousel src should be set to " + sampleBookPage.currentPage.src);
    assert.equal(angular.element("#bookPageImage").attr("alt"), "Page could not be found", "Book Page Carousel alt should be set to \"Page could not be found\"");

    //RESET TO PREVIOUS VALUES
    Books.setCurrentBookPage(previousCurrentPage);
});

/**
 * Check that alerts are correctly displayed when attempting to navigate to a page that doesn't exist
 */
QUnit.test("Display alerts when attempted to navigate to a page that doesn't exist", function(assert) {
    //STORE PREVIOUS VALUES
    var previousCurrentPage = Books.getCurrentBookPage();

    //Get Angular scope for the the currentPage
    var bookPageCtrlScope = angular.element("#bookPageCarousel").scope();

    Books.setCurrentBookPage(sampleBookPage);
    //Manually call .$apply() as it normally uses $applyAsync()
    bookPageCtrlScope.$apply();

    //As our current book only has one page, we shouldn't be able to navigate forward or back, so check that alerts appear on both
    angular.element("#bookPageCarouselPrev").click();
    assert.ok(angular.element("#prevPageWarning").is(":visible"), "Previous page warning should be visible");

    angular.element("#prevPageWarningClose").click();
    assert.ok(!angular.element("#prevPageWarning").is(":visible"), "Previous page warning should be hidden after the button is clicked");

    angular.element("#bookPageCarouselNext").click();
    assert.ok(angular.element("#nextPageWarning").is(":visible"), "Next page warning should be visible");

    angular.element("#nextPageWarningClose").click();
    assert.ok(!angular.element("#nextPageWarning").is(":visible"), "Next page warning should be hidden after the button is clicked");

    //RESET TO PREVIOUS VALUES
    Books.setCurrentBookPage(previousCurrentPage);
});

/**
 * Check book details are displaying correctly
 */
QUnit.test("Update BookPage details when changing book/page", function(assert) {
    //STORE PREVIOUS VALUES
    var previousCurrentPage = Books.getCurrentBookPage();

    //Get Angular scope for the the currentPage
    var bookPageCtrlScope = angular.element("#bookPageCarousel").scope();
    var bookPageDetailsCtrlScope = angular.element("#bookDetails").scope();

    //Remove the current book
    Books.setCurrentBookPage({});
    //Manually call .$apply() as it normally uses $applyAsync()
    bookPageCtrlScope.$apply();

    //Check that the currentPage scope was correctly updated
    assert.equal(bookPageDetailsCtrlScope.currentBookPage._id, null, "The _id of the currentBookPage in the Angular scope should be null (no current book)");

    //Check that the UI has been udpated to display the correct image
    assert.equal(angular.element("#pBookPageDetails").text(), "Currently Reading: Nothing", "Current Book/Page details displays \"Currently Reading: Nothing \"");

    Books.setCurrentBookPage(sampleBookPage);
    //Manually call .$apply() as it normally uses $applyAsync()
    bookPageCtrlScope.$apply();

    //Check that the currentPage scope was correctly updated
    assert.equal(bookPageDetailsCtrlScope.currentBookPage.title, sampleBookPage.title, "The bookPageDetails Angular scope has the correct title");
    assert.equal(bookPageDetailsCtrlScope.currentBookPage.currentPage.pageNum, sampleBookPage.currentPage.pageNum, "The bookPageDetails Angular scope has the correct page number");

    //Check that the UI has been udpated to display the correct image
    //Page Num will be displayed as + 1 as it makes more sense to the user
    assert.equal(angular.element("#pBookPageDetails").text(), "Currently Reading: " + sampleBookPage.title + " - Page: " + (sampleBookPage.currentPage.pageNum + 1), "Current Book/Page details displays \"Currently Reading: " + sampleBookPage.title + " - Page: " + sampleBookPage.currentPage.pageNum + "\"");

    //RESET TO PREVIOUS VALUES
    Books.setCurrentBookPage(previousCurrentPage);
});