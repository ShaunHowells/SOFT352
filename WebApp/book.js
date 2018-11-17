MainApp.getInstance().controller("bookCtlr", function($scope){
    $scope.book = {
        name: "Shaun's Test Book"
    };
    $scope.page = {
        pageNum: 1,
        pageImage: null,
        src: "testimage.jpg"
    };
});