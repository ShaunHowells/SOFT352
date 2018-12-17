//Mongoose Models
var models;

//Websocket
var websockets;

/**
 * Callback used when accessing Books from MongoDB
 * 
 * @callback chatCallback
 * @param {object} err - The error returned from MongoDB access
 * @param {object} result - The result returned from MongoDB access
 */

/**
 * Adds a new book to the collection
 *
 * @param {string} sessionId - The id of the session the message is being sent in
 * @param {array} userId -The id of the user sending the message
 * @param {chatCallback} callback - A callback to run after database access.
 */
var sendChatMessage = function(sessionId, userId, message, callback) {
    if (!webSockets) {
        console.error("Web sockets not set up.");
        callback(new Error("Web sockets not set up"), null);
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
};

/**
 * Sets available mongoose models
 *
 * @param {object} mongooseModels Available Mongoose models
 */
var setMongooseModels = function(mongooseModels) {
    models = mongooseModels;
}

/**
 * Set webSockets variable so that sessions can update websocket connections
 *
 * @param {object} newWebSockets The value to set webSockets to
 */
function setWebSockets(newWebSockets) {
    webSockets = newWebSockets;
}

module.exports = {
    sendChatMessage: sendChatMessage,
    setMongooseModels: setMongooseModels,
    setWebSockets: setWebSockets
};