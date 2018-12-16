const {
    BeforeAll,
    AfterAll
} = require("cucumber");
var request = require("request");

//Delete all sessions before and after tests
BeforeAll(function(callback) {
    request.post("http://localhost:9001/sessions/closeallsessions", {}, function(error, response, body) {
        if (error || !JSON.parse(body).success) {
            throw new Error("Failed to delete all sessions in BeforeAll");
        } else {
            callback();
        }
    });
});
AfterAll(function(callback) {
    request.post("http://localhost:9001/sessions/closeallsessions", {}, function(error, response, body) {
        if (error || !JSON.parse(body).success) {
            throw new Error("Failed to delete all sessions in BeforeAll");
        } else {
            callback();
        }
    });
});