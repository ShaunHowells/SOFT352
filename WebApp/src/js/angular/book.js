/**
 * bookListCtrl - Controller for displaying the list of books within the 'Create a new session' popup
 */
AngularMainApp.controller("bookListCtrl", function ($scope) {
    $scope.bookList = [];
    //Set $scope.bookList and update display ($applyAsync)
    $scope.setBookList = function (data) {
        $scope.bookList = data;
        $scope.$applyAsync();
    };
    //Set $scope.setBookList as callback in CollabBookReader.getBooks() - Called when bookList is updated
    CollabBookReader.getBooks().setBookListCallback($scope.setBookList);
    //Retrieve book list
    CollabBookReader.getBooks().retrieveBookList();
});

/**
 * bookListCtrl - Controller for displaying Book contents in centre carousel
 */
AngularMainApp.controller("pageCtrl", function ($scope) {

    //Set $scope.pageNum and $scope.pageImage and update the display ($applyAsync)
    $scope.updatePage = function (data) {
        $scope.pageNum = data.pageNum;
        $scope.pageImage = data.src;
        $scope.$applyAsync();
    };
    //Set $scope.updatePage as callback in CollabBookReader.getBooks() - Called when currentPage is updated
    CollabBookReader.getBooks().setUpdatePageCallback($scope.updatePage);

    $scope.book = {
        title: "Shaun's Test Book"
    };

});