MainApp.getInstance().controller("bookCtlr", function($scope){
    $scope.book = {
        title: "Shaun's Test Book"
    };
    $scope.page = {
        pageNum: 1,
        pageImage: null,
        src: "testimage.jpg"
    };
});