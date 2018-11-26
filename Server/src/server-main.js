var http = require("http");
var express = require("express");
var bodyParser = require('body-parser');

var app = express();
var port = 9000;

//Set up body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Set up routing + set database connection
require("./helpers/books/bookrouting.js")(app);
require("./helpers/sessions/sessionsrouting.js")(app);

var server = app.listen(port, function () {
    console.log(`Listening on port ${port}`)
});