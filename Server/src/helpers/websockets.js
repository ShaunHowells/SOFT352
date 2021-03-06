/**
 * WebSocket Management
 * @module WebSockets
 */


module.exports = function(server) {
    var WebSocketServer = require("websocket").server;
    var sessionsdb = require("../helpers/sessions/sessionsdb.js");

    //Store connected users in an object so I can easily refer to them by their unique id
    var connectedUsers = {};

    /**
     * Send a WebSocket message to all connected users
     *
     * @param {object} messageToSend JSON data to send to all connected users
     */
    function notifyAllConnectedUsers(messageToSend) {
        var message = JSON.stringify(messageToSend);
        for (var user in connectedUsers) {
            connectedUsers[user].sendUTF(message);
        }
    }

    /**
     * Send a WebSocket message to the specified users
     *
     * @param {object[]} sessionUsers Details of users to send the message to. Expected to be in the same format as the users in the Sessions Mongoose model.
     * @param {object} messageToSend JSON data to send to the specified users
     */
    function notifyUsers(sessionUsers, messageToSend) {
        var message = JSON.stringify(messageToSend);
        for (var user in connectedUsers) {
            for (var sessionUser in sessionUsers) {
                if (connectedUsers[user].shaun_uniqueId == sessionUsers[sessionUser].user_id) {
                    connectedUsers[user].sendUTF(message);
                    break;
                }
            }

        }
    }
    //Function to get a unique for a user
    function getUniqueId() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }
        return s4() + s4() + "-" + s4();
    }

    function sendSessionList(uniqueId) {
        //Send user all current sessions
        sessionsdb.getAllSessions(function(err, result) {
            if (err) {
                //If an error has occured then write to console and inform caller of error
                console.log(`Error in getAllSessions: ${err}`);

                //Check that our user is still here - Added for cases where a user joins and leaves instantly
                //If we can't retrieve the list of sessions, then something has gone wrong so close the websocket
                if (connectedUsers[uniqueId]) {
                    connectedUsers[uniqueId].close();
                }
            } else {
                //Check that our user is still here - Added for cases where a user joins and leaves instantly
                if (connectedUsers[uniqueId]) {
                    //If successful then return result to caller
                    connectedUsers[uniqueId].sendUTF(JSON.stringify({
                        type: "allsessions",
                        sessionList: result
                    }));
                }
            }
        });
    }

    //Set up websocket
    var socket = new WebSocketServer({
        httpServer: server
    });

    socket.on("request", function(request) {
        var connection = request.accept(null, request.origin);

        connection.on("close", function() {
            sessionsdb.removeUserFromAllSessions(connection.shaun_uniqueId);
            delete connectedUsers[connection.shaun_uniqueId];
            console.log("Connection closed - Total Connections: " + Object.keys(connectedUsers).length);
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
        notifyAllConnectedUsers: notifyAllConnectedUsers,
        notifyUsers: notifyUsers
    };
};