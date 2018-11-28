var MainApp = (function () {
    var mainApp;

    function createInstance(){
        mainApp = angular.module("mainApp", []);
        return mainApp;
    }

    return {
        getInstance: function (){
            if(!mainApp){
                mainApp = createInstance();
            } 
            return mainApp;
        }
    };
})();


$(document).ready(function () {
    $(".list-group-item").click(function (event) {
        $(".list-group-item").removeClass("active");
        $(this).addClass("active");
    });
});