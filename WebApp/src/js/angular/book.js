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
AngularMainApp.controller("bookPageCtrl", function ($scope) {

    //Set $scope.pageNum and $scope.pageImage and update the display ($applyAsync)
    $scope.updatePage = function (bookPage) {
        $scope.currentBookPage = bookPage;
        $scope.$applyAsync();
    };
    //Set $scope.updatePage as callback in CollabBookReader.getBooks() - Called when currentPage is updated
    CollabBookReader.getBooks().getUpdatePageBookObserver().subscribe($scope.updatePage);

    var prevPageWarningTimeout;
    //Navigate to previous page
    $scope.getPreviousPage = function (bookPage) {
        //If we we're at a page greater than 0, then navigate backwards
        //If we're at page 0 then we can't go backwards, so display an alert
        if (bookPage.currentPage.pageNum > 0) {
            CollabBookReader.getSessions().updateCurrentSessionBookPage(bookPage.currentPage.pageNum - 1);
        } else {
            //If timeout for exists, then clear it
            if (prevPageWarningTimeout) {
                clearTimeout(prevPageWarningTimeout);
            }
            //Show alert and cancel all current animations
            var prevPageWarning = angular.element("#prevPageWarning");
            prevPageWarning.stop();
            prevPageWarning.removeAttr("style");
            prevPageWarning.show();

            //After 3 seconds hide the alert
            prevPageWarningTimeout = window.setTimeout(function () {
                prevPageWarning.hide({
                    duration: 1000
                });
            }, 3000);
        }
    }
    //Hide the prevPageWarning - Called by button on alert
    $scope.hidePrevPageWarning = function () {
        if (prevPageWarningTimeout) {
            clearTimeout(prevPageWarningTimeout);
        }
        angular.element("#prevPageWarning").hide();
    }


    var nextPageWarningTimeout;
    //Navigate to next page
    $scope.getNextPage = function (bookPage) {
        //If we have pages left to go to (we aren't currently at the last page) then navigate to next page
        //If we're at the last page then display an alert
        if (bookPage.currentPage.pageNum < bookPage.pageCount - 1) {
            CollabBookReader.getSessions().updateCurrentSessionBookPage(bookPage.currentPage.pageNum + 1);
        } else {
            //If timeout exists, then clear it
            if (nextPageWarningTimeout) {
                clearTimeout(nextPageWarningTimeout);
            }
            //Show alert and cancel all current animations
            var nextPageWarning = angular.element("#nextPageWarning");
            nextPageWarning.stop();
            nextPageWarning.removeAttr("style");
            nextPageWarning.show();
            //After 3 sconds hide the alert
            nextPageWarningTimeout = window.setTimeout(function () {
                nextPageWarning.hide({
                    duration: 1000
                });
            }, 3000);
        }
    }
    //Hide the nextPageWarning - Called by button on alert
    $scope.hideNextPageWarning = function () {
        if (nextPageWarningTimeout) {
            clearTimeout(nextPageWarningTimeout);
        }
        angular.element("#nextPageWarning").hide();
    }
});

/**
 * Controller for displaying Book/Page contents in centre carousel
 */
AngularMainApp.controller("bookPageDetailsCtrl", function ($scope) {

    //Set $scope.pageNum and $scope.pageImage and update the display ($applyAsync)
    $scope.updatePage = function (bookPage) {
        $scope.currentBookPage = bookPage;
        $scope.$applyAsync();
    };
    //Set $scope.updatePage as callback in CollabBookReader.getBooks() - Called when currentPage is updated
    CollabBookReader.getBooks().getUpdatePageBookObserver().subscribe($scope.updatePage);

});