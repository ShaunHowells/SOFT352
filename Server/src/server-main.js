var http = require("http");
var express = require("express");
var bodyParser = require('body-parser');

var app = express();
var port = 9000;

//Set up body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Set up routing + set database connection
var booksRouting = require("./helpers/books/booksrouting.js")(app);
var sessionsRouting = require("./helpers/sessions/sessionsrouting.js")(app);

//Set up http server
var server = app.listen(port, function () {
    console.log(`Listening on port ${port}`)
});

var webSockets = require("./helpers/websockets")(server, sessionsRouting.sessionsdb);

sessionsRouting.sessionsdb.setWebSockets(webSockets);

