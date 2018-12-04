module.exports = function (server, sessionsDatabaseFunctions) {
    var http = require("http");
    var express = require("express");
    var WebSocketServer = require("websocket").server;
    var sessionsdb = sessionsDatabaseFunctions;

    //Store connected users in an object so I can easily refer to them by their unique id
    var connectedUsers = {};

    //Function to send a message to all connected users
    function notifyAllConnectedUsers(messageToSend) {
        var message = JSON.stringify(messageToSend);
        for (var user in connectedUsers) {
            connectedUsers[user].sendUTF(message);
        }
    }
    //Function to get a unique for a user
    function getUniqueId() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }
        return s4() + s4() + '-' + s4();
    };

    function sendSessionList(uniqueId) {
        //Send user all current sessions
        sessionsdb.getAllSessions(function (err, result) {
            if (err) {
                //If an error has occured then write to console and inform caller of error
                console.log(`Error in getAllSessions: ${err}`);
                connectedUsers[uniqueId].sendUTF(JSON.stringify({
                    type: "allsessions",
                    success: false,
                    message: "An error has occured trying to get all of the sessions. Please try again."
                }));
            } else {
                //If successful then return result to caller
                connectedUsers[uniqueId].sendUTF(JSON.stringify({
                    type: "allsessions",
                    success: true,
                    result: result
                }));
            }
        });
    }

    //Set up websocket
    var socket = new WebSocketServer({
        httpServer: server
    });

    socket.on("request", function (request) {
        var connection = request.accept(null, request.origin);

        connection.on("close", function (reasonCode, description) {
            sessionsdb.removeUserFromAllSessions(connection.shaun_uniqueId);
            delete connectedUsers[connection.shaun_uniqueId];
            console.log("Connection closed - Total Connections: " + Object.keys(connectedUsers).length);
        });

        connection.on("message", function (message) {
            console.log(message);
        });

        var uniqueId = getUniqueId();
        connection.shaun_uniqueId = uniqueId;
        connectedUsers[uniqueId] = connection;

        console.log("New Connection - Total Connections: " + Object.keys(connectedUsers).length);
        connection.sendUTF(JSON.stringify({
            clientId: uniqueId,
            type: "connected"
        }));

        sendSessionList(uniqueId);
    });

    return {
        notifyAllConnectedUsers: notifyAllConnectedUsers
    }
}