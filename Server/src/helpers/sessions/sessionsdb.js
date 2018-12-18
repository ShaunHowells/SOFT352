    //Variable to store webSockets
    var webSockets;

    //Mongoose Models
    var models;

    /**
     * Callback used when accessing Sessions from MongoDB
     * 
     * @callback sessionsCallback
     * @param {Object} err - The error returned from MongoDB access
     * @param {Object} result - The result returned from MongoDB access
     */

    /**
     * Gets all of the Sessions from MongoDB
     *
     * @param {sessionsCallback} callback - A callback to run after database access.
     */
    function getAllSessions(callback) {
        models.Sessions.find().select("-notes -users").populate({
            path: "currentBook",
            select: "_id title"
        }).exec(callback);
    };

    /**
     * Join a session
     *
     * @param {String} sessionId - The id of the session to be joined
     * @param {String} userId - The id of the user that is attempting to join the session
     * @param {sessionsCallback} callback - A callback to run after database access.
     */
    function joinSession(sessionId, user, callback) {
        //First check that user isn't already in the sesssion
        isUserInSession(sessionId, user.userId, function(err, inSession) {
            if (err) {
                callback(err, null);
            } else if (!inSession) {
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
                            result.populate({
                                path: "currentBook",
                                select: "_id title"
                            }, function(err, result) {
                                callback(err, result);
                            });
                            if (webSockets) {
                                webSockets.notifyUsers(result.users, {
                                    type: "userjoinedsession",
                                    user: user.username
                                });
                            }
                        });
                    } else {
                        callback("User is already in another session");
                    }
                });
            } else {
                callback("User is already in this session");
            }
        });
    };

    /**
     * Creates a new session
     *
     * @param {String} sessionName - The user input name of the new session
     * @param {Object} user - The id and username of the user that is attempting to create the session. Will be set as the owner of the session
     * @param {String} bookId - The id of the book being to be viewed in the session.
     * @param {sessionsCallback} callback - A callback to run after database access.
     */
    function createSession(sessionName, user, bookId, callback) {
        models.Books.findOne({
            _id: bookId
        }, function(err, result) {
            if (err) {
                callback(err, result);
            } else if (!result) {
                callback("A book with this Id does not exist");
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
                                //Only notify users if new session creation was successful
                                if (!err && webSockets) {
                                    webSockets.notifyAllConnectedUsers({
                                        type: "newsessioncreated",
                                        success: true,
                                        result: result
                                    });
                                    webSockets.notifyUsers(result.users, {
                                        type: "userjoinedsession",
                                        user: user.username
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
    };

    /**
     * Removes the specified user from the specified Session in MongoDB
     *
     * @param {String} sessionId - The id of the session that the user wants to leave
     * @param {String} userId - The id of the user that wants to leave the session
     * @param {sessionsCallback} callback - A callback to run after database access.
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
                        //Find username before we remove the user
                        var userList = result.users.toObject();
                        var username;
                        for (var i = 0; i < userList.length; i++) {
                            if (userList[i].user_id == userId) {
                                username = userList[i].username;
                                break;
                            }
                        }
                        models.Sessions.findOneAndUpdate({
                            _id: sessionId
                        }, {
                            $pull: {
                                users: {
                                    user_id: userId
                                }
                            }
                        }, {
                            new: true
                        }, function(err, result) {
                            if (err || !result) {
                                callback(err, result);
                            } else {
                                if (result.users.length == 0) {
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
                                    callback(err, result);

                                    if (webSockets) {
                                        webSockets.notifyUsers(result.users, {
                                            type: "userleftsession",
                                            user: username
                                        });
                                    }
                                }
                            }
                        });
                    }
                });
            } else {
                callback("User not in session");
            }
        });

    };


    /**
     * Remove a given user all sessions
     *
     * @param {String} userId - The id of the user to remove from all sessons
     * @param {sessionsCallback} callback - A callback to run after database access.
     */
    function removeUserFromAllSessions(userId) {
        models.Sessions.find({
            "users.user_id": userId
        }).exec(function(err, sessions) {
            sessions.forEach(function(session) {
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
    };

    /**
     * Change the current page of a session
     *
     * @param {String} sessionId ID of the session to retrieve the users from
     * @param {Integer} pageNum Number of the page to navigate to
     * @param {Function} callback to execute after users have been retrieved
     */
    var changeSessionPage = function(sessionId, pageNum, callback) {
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
    };

    /**
     *Get all users in a given session
     *
     * @param {String} sessionId ID of the session to retrieve the users from
     * @param {Function} callback to execute after users have been retrieved
     */
    var getSessionUsers = function(sessionId, callback) {
        models.Sessions.findOneAndUpdate({
            _id: sessionId
        }, "users", function(err, result) {
            if (err) {
                console.log(err);
            } else {
                callback(result);
            }
        });
    }

    /**
     * Check if a user is in a given session
     *
     * @param {String} sessionId ID of the session
     * @param {String} userId ID of the user
     * @param {Function} callback to execute after query has found (or not found) the user/session
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
     * @param {String} userId ID of the user
     * @param {Function} callback to execute after query has found (or not found) the user/session
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
     * Closes all current sessions - USED FOR TEST CLEANUP ONLY
     *
     * @param {Function} callback to execute after sessions have been deleted
     */
    var closeAllSessions = function(callback) {
        models.Sessions.deleteMany({}, function(err, result) {
            if (err) {
                console.log(err);
            }
            callback(err, result);
        })
    }

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
        getAllSessions: getAllSessions,
        joinSession: joinSession,
        createSession: createSession,
        removeUserFromSession: removeUserFromSession,
        removeUserFromAllSessions: removeUserFromAllSessions,
        changeSessionPage: changeSessionPage,
        getSessionUsers: getSessionUsers,
        closeAllSessions: closeAllSessions,
        isUserInSession: isUserInSession,
        setMongooseModels: setMongooseModels,
        setWebSockets: setWebSockets
    };