var request = require("sync-request");

var myHandlers = function () {
    this.registerHandler('BeforeFeatures', {
        timeout: 10000
    }, function (features, callback) {
        
    });
}

module.exports = myHandlers;