var http = require("http");
var express = require("express");
var WebSocketServer = require("websocket").server;

var sessionsdb = require("./sessionsdb.js");

var connectionList = [];

module.exports = function (server) {
    //Set up websocket
    var socket = new WebSocketServer({
        httpServer: server
    });

    socket.on("request", function (request) {
        var connection = request.accept(null, request.origin);

        connection.on("close", function (reasonCode, description) {
            console.log("Connection closed");
        });

        connection.on("message", function (message) {
            console.log(message);
        });

        sessionsdb.getAllSessions(function (err, result) {
            if (err) {
                //If an error has occured then write to console and inform caller of error
                console.log(`Error in getAllSessions: ${err}`);
                connection.sendUTF(JSON.stringify({
                    success: false,
                    message: "Add error has occured trying to get all of the sessions. Please try again."
                }));
            } else {
                //If successful then return result to caller
                connection.sendUTF(JSON.stringify({
                    success: true,
                    result: result
                }));
            }
        });
    });


    var notifyUsersAllSessions = function (allSessions){
        for(var connection in connectionList) {
            connection.sendUTF(JSON.stringify(allSessions));
        }
    }
}