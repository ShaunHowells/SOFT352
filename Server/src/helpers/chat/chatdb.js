//Mongoose Models
var models;

//Websocket
var websockets;

/**
 * Callback used when accessing Books from MongoDB
 * 
 * @callback booksCallback
 * @param {object} err - The error returned from MongoDB access
 * @param {object} result - The result returned from MongoDB access
 */

/**
 * Adds a new book to the collection
 *
 * @param {string} title - The title of the book to be added
 * @param {array} pageFiles - An array of files containing the images for each page (in order)
 * @param {booksCallback} callback - A callback to run after database access.
 */
var sendChatMessage = function (sessionId, userId, message, callback) {
    if (!webSockets) {
        console.error("Web sockets not set up.");
        callback(new Error("Web sockets not set up"), null);
    } else {
        models.Sessions.findOne({
            _id: sessionId
        }).exec(function (err, result) {
            callback(err, result);

            webSockets.notifyUsers(result.users, {
                type: "chatmessagereceived",
                success: true,
                result: {
                    user: userId,
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
var setMongooseModels = function (mongooseModels) {
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