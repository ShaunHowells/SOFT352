AngularMainApp.getInstance().controller("bookListCtrl", function($scope){
    $scope.bookList = [];
    //Set callback in sessions property of CollabBookReader in order to update available sessions list via angular
    $scope.setBookList = function (data) {
        $scope.bookList = data;
        $scope.$applyAsync();
    }
    CollabBookReader.getBooks().setBookListCallback(angular.element($("#createNewSessionBook")).scope().setBookList);
    CollabBookReader.getBooks().retrieveBookList();
})
.controller("bookCtrl", function($scope){
    $scope.book = {
        title: "Shaun's Test Book"
    };
    $scope.page = {
        pageNum: 1,
        pageImage: null,
        src: "testimage.jpg"
    };
});