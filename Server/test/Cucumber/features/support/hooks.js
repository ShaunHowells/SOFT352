const {
    BeforeAll,
    AfterAll,
    Before,
    After
} = require("cucumber");
var request = require("request");
var WebSocket = require("../../../../src/node_modules/websocket").client;

var world;

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

Before(function(testCase, callback) {
    world = this;
    world.websocket = new WebSocket();
    world.websocket.on("connect", function(connection) {
        world.websocketConnection = connection;
        connection.on("message", function(message) {
            var messageData = JSON.parse(message.utf8Data);
            switch (messageData.type) {
                // Message received containing our unique client id
                case "connected":
                    world.clientId = messageData.clientId;
                    callback();
                    break;
                default:
                    break;
            }
        });
    });
    world.websocket.connect("ws://localhost:9001");
});

//Get the id of a book to use as our sample book id
Before(function(testCase, callback) {
    // Create a session using a dummy user so that there's at least 1 available session
    request.post("http://localhost:9001/books/getallbooks", function(err, response) {
        var result = JSON.parse(response.body);
        if (result.result.length > 0) {
            world.retrievedBookId = result.result[0]._id;
        } else {
            assert.fail("No books exist in the test database");
        }
        callback();
    });
});

After(function() {
    world.websocketConnection.close();
    world.websocket = null;
});