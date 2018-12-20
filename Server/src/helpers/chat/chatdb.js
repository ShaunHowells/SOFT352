//Mongoose Models
var models;

//Websocket
var webSockets;

var sessionsdb = require("../sessions/sessionsdb.js");

/**
 * Callback used when processing Chat messages
 * 
 * @callback chatCallback
 * @param {Object} err - The error
 * @param {Object} result - The result
 */

/**
 * Sends a Chat message to all other users in the session
 *
 * @param {String} sessionId - The id of the session the message is being sent in
 * @param {String} userId -The id of the user sending the message
 * @param {String} message - The message being sent
 * @param {chatCallback} callback - A callback to run after database access.
 */
var sendChatMessage = function(sessionId, userId, message, callback) {
    if (!webSockets) {
        console.error("Web sockets not set up.");
        callback(new Error("Web sockets not set up"), null);
    } else {
        sessionsdb.isUserInSession(sessionId, userId, function(err, inSession) {
            if (!inSession) {
                callback("User is not in this session");
            } else if (err) {
                callback(err);
            } else {
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
                        success: true,
                        result: {
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
 * @param {Object} mongooseModels Available Mongoose models
 */
var setMongooseModels = function(mongooseModels) {
    models = mongooseModels;
};

/**
 * Set webSockets variable so that sessions can update websocket connections
 *
 * @param {Object} newWebSockets The value to set webSockets to
 */
function setWebSockets(newWebSockets) {
    webSockets = newWebSockets;
}

module.exports = {
    sendChatMessage: sendChatMessage,
    setMongooseModels: setMongooseModels,
    setWebSockets: setWebSockets
};