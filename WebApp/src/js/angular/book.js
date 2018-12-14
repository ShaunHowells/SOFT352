/**
 * Controller for displaying the list of books within the 'Create a new session' popup
 */
AngularMainApp.controller("bookListCtrl", function ($scope) {
    $scope.bookList = [];
    //Set $scope.bookList and update display ($applyAsync)
    $scope.setBookList = function (data) {
        $scope.bookList = data;
        $scope.$applyAsync();
    };
    //Set $scope.setBookList as callback in CollabBookReader.getBooks() - Called when bookList is updated
    CollabBookReader.getBooks().getBookListObserver().subscribe($scope.setBookList);
});

/**
 * Controller for displaying Book/Page contents in centre carousel
 */
AngularMainApp.controller("pageCtrl", function ($scope) {

    //Set $scope.pageNum and $scope.pageImage and update the display ($applyAsync)
    $scope.updatePage = function (bookPage) {
        $scope.currentBookPage = bookPage;
        $scope.$applyAsync();
    };
    //Set $scope.updatePage as callback in CollabBookReader.getBooks() - Called when currentPage is updated
    CollabBookReader.getBooks().getUpdatePageBookObserver().subscribe($scope.updatePage);

    $scope.getPreviousPage = function (bookPage) {
        if (bookPage.currentPage.pageNum > 0) {
            CollabBookReader.getSessions().updateCurrentSessionBookPage(bookPage.currentPage.pageNum - 1);
        } else {
            alert("There are no previous pages");
        }
    }

    $scope.getNextPage = function (bookPage) {
        if (bookPage.currentPage.pageNum < bookPage.pageCount - 1) {
            CollabBookReader.getSessions().updateCurrentSessionBookPage(bookPage.currentPage.pageNum + 1);
        } else {
            alert("There are no more pages");
        }
    }

    $scope.book = {
        title: "Shaun's Test Book"
    };

});