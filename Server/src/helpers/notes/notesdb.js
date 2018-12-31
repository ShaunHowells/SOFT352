/**
 * Notes Database Access
 * @module Notesdb
 */

//Mongoose Models
var models;
//Websocket connections
var webSockets;
//Sessions database access
var sessionsdb = require("../sessions/sessionsdb.js");

/**
 * Add a new note to a session
 *
 * @param {string} sessionId - The id of the session the note is being added to
 * @param {string} userId -The id of the user adding the note
 * @param {string} note - The contents of the note being added
 * @param {number} pageNum - The number of the page the note is being added to
 * @param {callback} callback - A callback to run after database access.
 */
var addNoteToSession = function(sessionId, userId, note, pageNum, callback) {
    //This requires websockets to be set up, so if it isn't then we can't continue
    if (!webSockets) {
        console.error("Web sockets not set up.");
        callback(new Error("Web sockets not set up"), null);
    } else {
        //Check that the user is in the session they are trying to add the note to
        sessionsdb.isUserInSession(sessionId, userId, function(err, inSession) {
            if (!inSession) {
                callback("User is not in this session");
            } else if (err) {
                callback(err);
            } else {
                //First find the session the note is being added to
                //Find the list of users so we know the users who need to be told about the new note
                //Get the book being read so that we can check if the supplied pageNum is present in the book
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
                        //As the book belongs in another table we need to populate the currentBook to retrieve the number of pages
                        result.populate({
                            path: "currentBook",
                            select: "pageCount"
                        }, function(err, result) {
                            if (pageNum < 0 || pageNum > result.currentBook.pageCount - 1) {
                                callback("This page does not exist in the book");
                            } else {
                                //Add the note to the session and return the new session details
                                //The session details are returned so that we know the _id of the newly created note to return
                                models.Sessions.findOneAndUpdate({
                                    _id: sessionId
                                }, {
                                    "$push": {
                                        "notes": {
                                            user: username,
                                            note: note,
                                            pageNum: pageNum,
                                            sessionId: sessionId
                                        }
                                    }
                                }, {
                                    new: true
                                }, function(err, result) {
                                    if (err || !result) {
                                        callback(err, result);
                                    } else {
                                        var newNote = result.notes[result.notes.length - 1];
                                        callback(err, newNote);
                                        //Notify all users in the session of the newly added note
                                        if (webSockets) {
                                            webSockets.notifyUsers(result.users, {
                                                type: "newnoteadded",
                                                note: newNote
                                            });
                                        }
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }
};
/**
 * Get all notes from a session
 *
 * @param {string} sessionId - The id of the session to delete the note from
 * @param {string} noteId - The id of the note being deleted
 * @param {string} userId - The id of user deleting the note
 * @param {callback} callback - A callback to run after database access.
 */
var removeNoteFromSession = function(sessionId, noteId, userId, callback) {
    //This requires the user of websockets, so if the websockets aren't set up then we can't continue
    if (!webSockets) {
        console.error("Web sockets not set up.");
        callback(new Error("Web sockets not set up"), null);
    } else {
        //Check that the user is in the session they want to remove the note from
        sessionsdb.isUserInSession(sessionId, userId, function(err, inSession) {
            if (!inSession) {
                callback("User is not in this session");
            } else if (err) {
                callback(err);
            } else {
                //Remove the note from the session
                models.Sessions.findOneAndUpdate({
                    _id: sessionId
                }, {
                    $pull: {
                        notes: {
                            _id: noteId
                        }
                    }
                }, function(err, result) {
                    //If there was an error, or no result returned, then the note was not removed
                    if (err || !result) {
                        callback(err, result);
                    } else {
                        callback(err, {
                            removed: true
                        });
                        //Inform users
                        if (webSockets) {
                            webSockets.notifyUsers(result.users, {
                                type: "noteremoved",
                                success: true,
                                noteId: noteId
                            });
                        }
                    }
                });
            }
        });
    }
};

/**
 * Get all notes from a session
 *
 * @param {string} sessionId - The id of the session to retrieve the notes from
 * @param {string} userId - The id of the user retrieving the notes
 * @param {callback} callback - A callback to run after database access.
 */
var getAllSessionNotes = function(sessionId, userId, callback) {
    //Check that the user in the session they want to retrieve the notes for
    sessionsdb.isUserInSession(sessionId, userId, function(err, inSession) {
        if (!inSession) {
            callback("User is not in this session");
        } else if (err) {
            callback(err);
        } else {
            //Retrieve the notes from the session
            models.Sessions.findOne({
                _id: sessionId
            }).select("notes").exec(function(err, result) {
                callback(err, result);
            });
        }
    });
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
    addNoteToSession: addNoteToSession,
    setMongooseModels: setMongooseModels,
    setWebSockets: setWebSockets,
    getAllSessionNotes: getAllSessionNotes,
    removeNoteFromSession: removeNoteFromSession
};