var http = require("http");
var express = require("express");
var bodyParser = require('body-parser');

var app = express();
var port = 9000;

var myArgs = process.argv.slice(2);
var test = false;
switch (myArgs[0]) {
    case 'test':
        console.log("Enabling Test Mode");
        test = true;
        break;
    default:
        break;
}

//Set up body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

//Set up routing + set database connection
var booksRouting = require("./helpers/books/booksrouting.js")(app);
var sessionsRouting = require("./helpers/sessions/sessionsrouting.js")(app);

//Set up http server
var server = app.listen(port, function () {
    console.log(`Listening on port ${port}`)
});

//Setup mongoonse models
var mongooseModels = require("./helpers/mongoose.js")(test);
sessionsRouting.sessionsdb.setMongooseModels(mongooseModels.models);
booksRouting.booksdb.setMongooseModels(mongooseModels.models);


var webSockets = require("./helpers/websockets")(server);

sessionsRouting.sessionsdb.setWebSockets(webSockets);