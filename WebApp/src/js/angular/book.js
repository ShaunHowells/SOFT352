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
AngularMainApp.controller("bookCtrl", function ($scope) {
    $scope.book = {
        title: "Shaun's Test Book"
    };
    $scope.page = {
        pageNum: 1,
        pageImage: null,
        src: "testimage.jpg"
    };
});