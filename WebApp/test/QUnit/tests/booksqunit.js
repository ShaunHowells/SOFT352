var sampleBookList = [{
    "_id": "5bf59ade4cb1550530740989",
    "title": "Shaun's Test Book",
    "__v": 0
}];

QUnit.test("Books #1 - Display list of books in Create Session book list", function (assert) {
    var currentlyActiveTabHeading = angular.element("#sessionTabList").find("li .active");
    var previousBookList = CollabBookReader.getBooks().getBookList();

    var bookListCount;
    //Get scope for bookListCtrl
    var bookListCtrlScope = angular.element($("#createNewSessionBook")).scope();

    //Click currentUserSessionsTabHeading to display Create new session button
    angular.element("#currentUserSessionsTabHeading").click();

    angular.element("#createNewSession").click();
    assert.ok(angular.element("#createNewSessionModal").is(":visible"), "Create new session modal is currently being displayed");

    //Set values in createNewSessionModal
    angular.element("#createNewSessionName").val("QUnit Test Session");

    CollabBookReader.getBooks().setBookList(sampleBookList);
    //Manually call .$apply() as it normally uses $applyAsync()
    bookListCtrlScope.$apply();

    bookListCount = bookListCtrlScope.bookList.length;
    assert.equal(bookListCount, 1, "1 book should be in the bookList in the $scope");
    assert.equal(angular.element("#createNewSessionBook").children("option").length, 2, "2 books should be in the list (with 1 being an 'unselected' option)");



    //Close createNewSessionModal
    angular.element("#createNewSessionModalClose").click();
    currentlyActiveTabHeading.click();
    CollabBookReader.getBooks().setBookList(previousBookList);
});