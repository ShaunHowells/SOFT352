//Mongoose Models
var models;

//Websocket
var websockets;

var sessionsdb = require("../sessions/sessionsdb.js");

/**
 * Callback used when accessing Books from MongoDB
 * 
 * @callback notesCallback
 * @param {Object} err - The error returned from MongoDB access
 * @param {Object} result - The result returned from MongoDB access
 */

/**
 * Add a new note to a session
 *
 * @param {String} sessionId - The id of the session the message is being sent in
 * @param {String} userId -The id of the user sending the message
 * @param {String} note - The contents of the note being added
 * @param {Integer} pageNum - The number of the page the note is being added to
 * @param {notesCallback} callback - A callback to run after database access.
 */
var addNoteToSession = function(sessionId, userId, note, pageNum, callback) {
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
                }).select("currentBook users").exec(function(err, result) {
                    if (err || !result) {
                        callback(err, result);
                    } else {
                        var userList = result.users.toObject();
                        var username;
                        for (var i = 0; i < userList.length; i++) {
                            if (userList[i].user_id == userId) {
                                username = userList[i].username;
                                break;
                            }
                        }
                        result.populate({
                            path: "currentBook",
                            select: "pageCount"
                        }, function(err, result) {
                            if (pageNum < 0 || pageNum > result.currentBook.pageCount - 1) {
                                callback("This page does not exist in the book");
                            } else {
                                models.Sessions.findOneAndUpdate({
                                    _id: sessionId
                                }, {
                                    "$push": {
                                        "notes": {
                                            user: username,
                                            note: note,
                                            pageNum: pageNum
                                        }
                                    }
                                }, {
                                    new: true
                                }, function(err, result) {
                                    result.populate({
                                        path: "currentBook",
                                        select: "_id title"
                                    }, function(err, result) {
                                        callback(err, result);
                                    });
                                    if (webSockets) {
                                        webSockets.notifyUsers(result.users, {
                                            type: "newnoteadded",
                                            note: result.notes[result.notes.length - 1]
                                        });
                                    }
                                });
                            };
                        });
                    };
                });
            };
        });
    };
};

/**
 * Add a new note to a session
 *
 * @param {String} sessionId - The id of the session the message is being sent in
 * @param {String} userId -The id of the user sending the message
 * @param {String} note - The contents of the note being added
 * @param {Integer} pageNum - The number of the page the note is being added to
 * @param {notesCallback} callback - A callback to run after database access.
 */
var getAllSessionNotes = function(sessionId, userId, callback) {
    sessionsdb.isUserInSession(sessionId, userId, function(err, inSession) {
        if (!inSession) {
            callback("User is not in this session");
        } else if (err) {
            callback(err);
        } else {
            models.Sessions.findOne({
                _id: sessionId
            }).select("notes").exec(function(err, result) {
                callback(err, result);
            });
        };
    });
};


/**
 * Sets available mongoose models
 *
 * @param {Object} mongooseModels Available Mongoose models
 */
var setMongooseModels = function(mongooseModels) {
    models = mongooseModels;
}

/**
 * Set webSockets variable so that sessions can update websocket connections
 *
 * @param {Object} newWebSockets The value to set webSockets to
 */
function setWebSockets(newWebSockets) {
    webSockets = newWebSockets;
}

module.exports = {
    addNoteToSession: addNoteToSession,
    setMongooseModels: setMongooseModels,
    setWebSockets: setWebSockets,
    getAllSessionNotes: getAllSessionNotes
};