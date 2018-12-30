var express = require("express");
var bodyParser = require("body-parser");

//Get commandline arguments
var myArgs = process.argv.slice(2);
var test = false;
for (arg in myArgs) {
    switch (myArgs[arg]) {
        case "test":
            console.log("Enabling Test Mode");
            test = true;
            break;
        case "no-logging":
            console.log = function() {};
            console.error = function() {};
            break;
        default:
            break;
    }
}

var app = express();
var port;
if (test) {
    port = 9001;
} else {
    port = 9000;
}

//Set up body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

//Set up routing + set database connection
var booksRouting = require("./helpers/books/booksrouting.js")(app);
var sessionsRouting = require("./helpers/sessions/sessionsrouting.js")(app, test);
var chatRouting = require("./helpers/chat/chatrouting.js")(app);
var notesRouting = require("./helpers/notes/notesrouting.js")(app);

//Set up http server
var server = app.listen(port, function() {
    console.log(`Listening on port ${port}`);
});

//Setup mongoonse models
var mongooseModels = require("./helpers/mongoose.js")(test);
sessionsRouting.sessionsdb.setMongooseModels(mongooseModels.models);
booksRouting.booksdb.setMongooseModels(mongooseModels.models);
chatRouting.chatdb.setMongooseModels(mongooseModels.models);
notesRouting.notesdb.setMongooseModels(mongooseModels.models);

//Pass websockets through to classes
var webSockets = require("./helpers/websockets")(server);
sessionsRouting.sessionsdb.setWebSockets(webSockets);
chatRouting.chatdb.setWebSockets(webSockets);
notesRouting.notesdb.setWebSockets(webSockets);

//Set root page
app.get("/", function(req, res) {
    res.send("CollabBookReader Server");
});