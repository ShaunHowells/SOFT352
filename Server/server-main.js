var http = require("http");
var express = require("express");
var app = express();
var port = 9000;

app.get("/listsessions", function(request, response){
    //Implement code to list all sessions
    
    response.send();
});

app.get("/createsession", function(request, response){
    //Implement code to create a session

    response.send();
});

app.get("/joinsession", function(request, response){
    //Implement code to join a session

    response.send();
});



var server = app.listen(port, function(){
    console.log(`Listening on port ${port}`)
});