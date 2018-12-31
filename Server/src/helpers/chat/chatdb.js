/**
 * Chat messages handling
 * @module Chatdb
 */

//Mongoose Models
var models;
//WebSockets connections
var webSockets;
//Sessions database access
var sessionsdb = require("../sessions/sessionsdb.js");

/**
 * Sends a Chat message to all other users in the session
 *
 * @param {string} sessionId - The id of the session the message is being sent in
 * @param {string} userId -The id of the user sending the message
 * @param {string} message - The message being sent
 * @param {callback} callback - A callback to run after database access.
 */
var sendChatMessage = function(sessionId, userId, message, callback) {
    //This requires the user of websockets, so if websockets haven't been set up we can't continue
    if (!webSockets) {
        console.error("Web sockets not set up.");
        callback(new Error("Web sockets not set up"), null);
    } else {
        //Check that the user is in the session they are trying to send the message in
        sessionsdb.isUserInSession(sessionId, userId, function(err, inSession) {
            if (err) {
                callback(err);
            } else if (!inSession) {
                callback(`User: ${userId} is not in Session ${sessionId}`);
            } else {
                //Get the session from the database so we can retrieve the list of users to send the message to
                models.Sessions.findOne({
                    _id: sessionId
                }).exec(function(err, result) {
                    callback(err, result);

                    var userList = result.users.toObject();
                    var username;
                    for (var i = 0; i < userList.length; i++) {
                        if (userList[i].user_id == userId) {
                            username = userList[i].username;
                            break;
                        }
                    }
                    //Notify this sessions users
                    webSockets.notifyUsers(userList, {
                        type: "chatmessagereceived",
                        chatMessage: {
                            user: username,
                            message: message
                        }
                    });
                });
            }
        });
    }
};

/**
 * Sets available mongoose models
 *
 * @param {object} mongooseModels - Available Mongoose models
 */
var setMongooseModels = function(mongooseModels) {
    models = mongooseModels;
};

/**
 * Set webSockets variable so that sessions can update websocket connections
 *
 * @param {object} newWebSockets - The value to set webSockets to
 */
function setWebSockets(newWebSockets) {
    webSockets = newWebSockets;
}

module.exports = {
    sendChatMessage: sendChatMessage,
    setMongooseModels: setMongooseModels,
    setWebSockets: setWebSockets
};