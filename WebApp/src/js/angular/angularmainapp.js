var AngularMainApp = (function () {
    var angularMainApp;

    function createInstance(){
        angularMainApp = angular.module("AngularMainApp", []);
        return angularMainApp;
    }

    return {
        getInstance: function (){
            if(!angularMainApp){
                angularMainApp = createInstance();
            } 
            return angularMainApp;
        }
    };
})();