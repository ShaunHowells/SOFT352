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