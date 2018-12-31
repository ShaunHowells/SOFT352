/**
 * Sessions Database Access
 * @module Sessionsdb
 */

//Variable to store webSockets
var webSockets;

//Mongoose Models
var models;

/**
 * Gets all of the Sessions from MongoDB
 *
 * @param {callback} callback - A callback to run after database access.
 */
function getAllSessions(callback) {
    //Retrieve the list of sessions + book details, but exclude the notes and user list as these can be quite large and shouldn't be shown to users not in the session
    models.Sessions.find().select("-notes -users").populate({
        path: "currentBook",
        select: "_id title"
    }).exec(callback);
}

/**
 * Join a session
 *
 * @param {string} sessionId - The id of the session to be joined
 * @param {string} userId - The id of the user that is attempting to join the session
 * @param {callback} callback - A callback to run after database access.
 */
function joinSession(sessionId, user, callback) {
    //First check that user isn't already in a sesssion
    isUserInAnySession(user.userId, function(err, inAnySession) {
        if (err) {
            callback(err, null);
        } else if (!inAnySession) {
            //Find the session and add the user to it
            models.Sessions.findOneAndUpdate({
                _id: sessionId
            }, {
                "$push": {
                    "users": {
                        user_id: user.userId,
                        username: user.username
                    }
                }
            }, {
                new: true
            }, function(err, result) {
                //If err or no result returned then the user won't have been added
                if (err || !result) {
                    callback(err, result);
                } else {
                    //Populate the details of the book so we can return them to the user
                    result.populate({
                        path: "currentBook",
                        select: "_id title"
                    }, function(err, result) {
                        //Return completed result to the user
                        callback(err, result);
                    });
                    //Find the unique id of the user who was just added to the session
                    var userId;
                    var userList = result.users.toObject();
                    for (var i = 0; i < userList.length; i++) {
                        if (userList[i].user_id == user.userId) {
                            userId = userList[i]._id;
                            break;
                        }
                    }
                    //Notify all users in the session that a new user has just joined
                    if (webSockets) {
                        webSockets.notifyUsers(userList, {
                            type: "userjoinedsession",
                            user: {
                                _id: userId,
                                username: user.username
                            }
                        });
                    }
                }
            });
        } else {
            callback("User is already in another session");
        }
    });
}

/**
 * Creates a new session
 *
 * @param {string} sessionName - The user input name of the new session
 * @param {object} user - The id and username of the user that is attempting to create the session. Will be set as the owner of the session
 * @param {string} bookId - The id of the book being to be viewed in the session.
 * @param {callback} callback - A callback to run after database access.
 */
function createSession(sessionName, user, bookId, callback) {
    //First check that the user isn't in another session
    isUserInAnySession(user.userId, function(err, inAnySession) {
        if (err) {
            callback(err, null);
        } else if (!inAnySession) {
            //Check that the bookId they have supplied is a real book
            models.Books.findOne({
                _id: bookId
            }, function(err, result) {
                if (err) {
                    callback(err, result);
                } else if (!result) {
                    callback("A book with this ID does not exist");
                } else {
                    //Create the new session with the details provided
                    var newSession = new models.Sessions({
                        name: sessionName,
                        owner: user.username,
                        currentPageNum: 0,
                        currentBook: bookId,
                        users: [{
                            user_id: user.userId,
                            username: user.username
                        }]
                    });
                    newSession.save(function(err, result) {
                        //Populate the book in the session so that we can return it to the user
                        result.populate({
                            path: "currentBook",
                            select: "_id title"
                        }, function(err, result) {
                            if (err || !result) {
                                callback(err, result);
                            } else {
                                callback(err, result);
                                //Get the unique Id (generated by MongoDb) of the user in the session
                                var userList = result.users.toObject();
                                var userId;
                                for (var i = 0; i < userList.length; i++) {
                                    if (userList[i].user_id == user.userId) {
                                        userId = userList[i]._id;
                                        break;
                                    }
                                }
                                //Inform every user connected that a new session has been created
                                //Inform all users in the session (should only be the person who created it) that someone has joined
                                if (!err && webSockets) {
                                    webSockets.notifyAllConnectedUsers({
                                        type: "newsessioncreated",
                                        success: true,
                                        result: result
                                    });
                                    webSockets.notifyUsers(userList, {
                                        type: "userjoinedsession",
                                        user: {
                                            _id: userId,
                                            username: user.username
                                        }
                                    });
                                }
                            }
                        });
                    });
                }
            });
        } else {
            callback("User is already in another session");
        }
    });
}

/**
 * Removes the specified user from the specified Session in MongoDB
 *
 * @param {string} sessionId - The id of the session that the user wants to leave
 * @param {string} userId - The id of the user that wants to leave the session
 * @param {callback} callback - Callback to run after database access.
 */
function removeUserFromSession(sessionId, userId, callback) {
    //Check that user is in that session
    isUserInSession(sessionId, userId, function(err, inSession) {
        if (err) {
            callback(err, null);
        } else if (inSession) {
            //Retrieve the session
            models.Sessions.findOne({
                "_id": sessionId
            }).exec(function(err, result) {
                if (err) {
                    callback(err, result);
                } else if (!result) {
                    //If not result return
                    callback(err, result);
                } else {
                    //Find username/_id before we remove the user
                    var userList = result.users.toObject();
                    var userLength = userList.length;
                    var foundUser;
                    for (var i = 0; i < userList.length; i++) {
                        if (userList[i].user_id == userId) {
                            foundUser = userList[i];
                            //Remove user from list for later
                            userList.splice(i, 1);
                            break;
                        }
                    }
                    //If we only have one user then we will remove the session as a session shouldn't exist with 0 users
                    //Otherwise remove the user from the session
                    if (userLength <= 1) {
                        result.remove(callback);
                        //Inform every user that the session has been closed and is no longer available
                        if (webSockets) {
                            webSockets.notifyAllConnectedUsers({
                                type: "sessionremoved",
                                success: true,
                                result: {
                                    sessionId: sessionId
                                }
                            });
                        }
                    } else {
                        //Remove the user from the session
                        models.Sessions.updateOne({
                            _id: sessionId
                        }, {
                            $pull: {
                                users: {
                                    user_id: userId
                                }
                            }
                        }, function(err, result) {
                            if (err || !result) {
                                callback(err, {});
                            } else {
                                callback(err, {});
                                //Notify users in the session that the user has left
                                if (webSockets) {
                                    webSockets.notifyUsers(userList, {
                                        type: "userleftsession",
                                        user: {
                                            _id: foundUser._id,
                                            username: foundUser.username
                                        }
                                    });
                                }
                            }
                        });
                    }
                }
            });
        } else {
            callback("User not in session");
        }
    });
}


/**
 * Remove a given user all sessions - Used when their websocket closes to ensure they aren't in any sessions
 *
 * @param {string} userId - The id of the user to remove from all sessons
 * @param {callback} callback - Callback to run after database access.
 */
function removeUserFromAllSessions(userId) {
    //Find all of the sessions they user is in.
    //We expect them to be in max 1 session
    models.Sessions.find({
        "users.user_id": userId
    }).exec(function(err, sessions) {
        sessions.forEach(function(session) {
            //Find username/_id before we remove the user
            var userList = session.users.toObject();
            var username;
            var foundUserId;
            for (var i = 0; i < userList.length; i++) {
                if (userList[i].user_id == userId) {
                    username = userList[i].username;
                    foundUserId = userList[i]._id;
                    break;
                }
            }
            //If they are the only user in the session then close the session
            //Otherwise remove them from the session
            if (session.users.length > 1) {
                models.Sessions.updateOne({
                    _id: session._id
                }, {
                    $pull: {
                        users: {
                            user_id: userId
                        }
                    }
                }, function(err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(`User: ${userId} has been removed from Session: ${session._id}`);
                        if (webSockets) {
                            webSockets.notifyUsers(userList, {
                                type: "userleftsession",
                                user: {
                                    _id: foundUserId,
                                    username: username
                                }
                            });
                        }
                    }
                });
            } else {
                session.remove();
                if (webSockets) {
                    webSockets.notifyAllConnectedUsers({
                        type: "sessionremoved",
                        success: true,
                        result: {
                            sessionId: session._id
                        }
                    });
                }
            }
        });
    });
}

/**
 * Change the current page of a session
 *
 * @param {string} sessionId - ID of the session to retrieve the users from
 * @param {number} pageNum - Number of the page to navigate to
 * @param {callback} callback - Callback to execute after users have been retrieved
 */
var changeSessionPage = function(sessionId, pageNum, userId, callback) {
    //Check that user is in that session
    isUserInSession(sessionId, userId, function(err, inSession) {
        if (err) {
            callback(err, null);
        } else if (inSession) {
            //Find the session the user is in
            models.Sessions.findOne({
                _id: sessionId
            }).select("currentBook").exec(function(err, result) {
                if (err || !result) {
                    callback(err, result);
                } else {
                    //Retrieve the details of the book in the session so that we can check if the page turn will go out of bounds of the book
                    result.populate({
                        path: "currentBook",
                        select: "_id title pageCount"
                    }, function(err, result) {
                        if (pageNum < 0 || pageNum > result.currentBook.pageCount - 1) {
                            callback("This page does not exist in the book");
                        } else {
                            //Update the session and return the new values
                            models.Sessions.findOneAndUpdate({
                                _id: sessionId
                            }, {
                                "$set": {
                                    "currentPageNum": pageNum
                                }
                            }, {
                                new: true,
                                fields: {
                                    "currentBook.pages": false
                                }
                            }, function(err, result) {
                                if (err || !result) {
                                    callback(err, result);
                                } else {
                                    result.populate({
                                        path: "currentBook",
                                        select: "_id title"
                                    }, function(err, result) {
                                        callback(err, result);
                                        if (!err && webSockets) {
                                            webSockets.notifyUsers(result.users, {
                                                type: "pagechanged",
                                                success: true,
                                                result: result
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        } else {
            callback("User isn't in this session");
        }
    });
};

/**
 * Check if a user is in a given session
 *
 * @param {string} sessionId - ID of the session
 * @param {string} userId - ID of the user
 * @param {callback} callback - Callback to execute after query has found (or not found) the user/session
 */
var isUserInSession = function(sessionId, userId, callback) {
    //Find the provided session and check that the user is in that session
    models.Sessions.findOne({
        _id: sessionId,
        "users.user_id": userId
    }, function(err, result) {
        if (err) {
            console.log(err);
            callback(err, false);
        } else if (!result) {
            callback(null, false);
        } else {
            callback(null, true);
        }
    });
};
/**
 * Check if a user is in a any session
 *
 * @param {string} userId - ID of the user
 * @param {callback} callback - Callback to execute after query has found (or not found) the user/session
 */
var isUserInAnySession = function(userId, callback) {
    //Try to find any sessions with this user in it
    models.Sessions.findOne({
        "users.user_id": userId
    }, function(err, result) {
        if (err) {
            console.log(err);
            callback(err, false);
        } else if (!result) {
            callback(null, false);
        } else {
            callback(null, true);
        }
    });
};

/**
 * Closes all current sessions - Used for clean up before/after tests and when starting the server
 *
 * @param {callback} callback - Callback to execute after sessions have been deleted
 */
var closeAllSessions = function(callback) {
    //Close every session
    models.Sessions.deleteMany({}, function(err, result) {
        if (err) {
            console.log(err);
        }
        if (callback)
            callback(err, result);
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
    getAllSessions: getAllSessions,
    joinSession: joinSession,
    createSession: createSession,
    removeUserFromSession: removeUserFromSession,
    removeUserFromAllSessions: removeUserFromAllSessions,
    changeSessionPage: changeSessionPage,
    closeAllSessions: closeAllSessions,
    isUserInSession: isUserInSession,
    setMongooseModels: setMongooseModels,
    setWebSockets: setWebSockets
};