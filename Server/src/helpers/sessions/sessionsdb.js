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
    //First check that user isn't already in the sesssion
    isUserInAnySession(user.userId, function(err, inAnySession) {
        if (err) {
            callback(err, null);
        } else if (!inAnySession) {
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
                if (err || !result) {
                    callback(err, result);
                } else {
                    result.populate({
                        path: "currentBook",
                        select: "_id title"
                    }, function(err, result) {
                        callback(err, result);
                    });
                    var userId;
                    var userList = result.users.toObject();
                    for (var i = 0; i < userList.length; i++) {
                        if (userList[i].user_id == user.userId) {
                            userId = userList[i]._id;
                            break;
                        }
                    }
                    if (webSockets) {
                        webSockets.notifyUsers(result.users, {
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
    models.Books.findOne({
        _id: bookId
    }, function(err, result) {
        if (err) {
            callback(err, result);
        } else if (!result) {
            callback("A book with this ID does not exist");
        } else {
            isUserInAnySession(user.userId, function(err, inAnySession) {
                if (err) {
                    callback(err, null);
                } else if (!inAnySession) {
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
                        //Get currentBook _id and title to return
                        result.populate({
                            path: "currentBook",
                            select: "_id title"
                        }, function(err, result) {
                            callback(err, result);

                            var userList = result.users.toObject();
                            var userId;
                            for (var i = 0; i < userList.length; i++) {
                                if (userList[i].user_id == user.userId) {
                                    userId = userList[i]._id;
                                    break;
                                }
                            }
                            //Only notify users if new session creation was successful
                            if (!err && webSockets) {
                                webSockets.notifyAllConnectedUsers({
                                    type: "newsessioncreated",
                                    success: true,
                                    result: result
                                });
                                webSockets.notifyUsers(result.users, {
                                    type: "userjoinedsession",
                                    user: {
                                        _id: userId,
                                        username: user.username
                                    }
                                });
                            }
                        });
                    });
                } else {
                    callback("User is already in another session");
                }
            });
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

                    if (userLength <= 1) {
                        result.remove(callback);
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
 * Remove a given user all sessions
 *
 * @param {string} userId - The id of the user to remove from all sessons
 * @param {callback} callback - Callback to run after database access.
 */
function removeUserFromAllSessions(userId) {
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
            if (session.users.length > 1) {
                models.Sessions.findOneAndUpdate(session._id, {
                    $pull: {
                        users: {
                            user_id: userId
                        }
                    }
                }, function(err, result) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(`User: ${userId} has been removed from Session: ${result._id}`);
                        if (webSockets) {
                            webSockets.notifyUsers(result.users, {
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
                var sessionId = session._id;
                session.remove();
                if (webSockets) {
                    webSockets.notifyAllConnectedUsers({
                        type: "sessionremoved",
                        success: true,
                        result: {
                            sessionId: sessionId
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
            models.Sessions.findOne({
                _id: sessionId
            }).select("currentBook").exec(function(err, result) {
                if (err || !result) {
                    callback(err, result);
                } else {
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