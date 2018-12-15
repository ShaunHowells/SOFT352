    //Variable to store webSockets
    var webSockets;

    //Mongoose Models
    var models;

    /**
     * Callback used when accessing Sessions from MongoDB
     * 
     * @callback sessionsCallback
     * @param {object} err - The error returned from MongoDB access
     * @param {object} result - The result returned from MongoDB access
     */

    /**
     * Gets all of the Sessions from MongoDB
     *
     * @param {sessionsCallback} callback - A callback to run after database access.
     */
    function getAllSessions(callback) {
        models.Sessions.find().populate({
            path: "currentBook",
            select: "_id title"
        }).exec(callback);
    };

    /**
     * Returns the session with a given id.
     *
     * @param {string} sessionId - The id of the session you want to retrieve.
     * @param {sessionsCallback} callback - A callback to run after database access.
     */
    function getSessionById(sessionId, callback) {
        models.Sessions.findOne({
            _id: sessionId
        }).populate({
            path: "currentBook",
            select: "_id title"
        }).exec(callback);
    };

    /**
     * Join a session
     *
     * @param {string} sessionId - The id of the session to be joined
     * @param {string} userId - The id of the user that is attempting to join the session
     * @param {sessionsCallback} callback - A callback to run after database access.
     */
    function joinSession(sessionId, userId, callback) {
        models.Sessions.findOneAndUpdate({
            _id: sessionId
        }, {
            "$push": {
                "users": {
                    user_id: userId
                }
            }
        }, {
            new: true,
        }, function (err, result) {
            result.populate({
                path: "currentBook",
                select: "_id title"
            }, function (err, result) {
                callback(err, result);
            });
        });
    };

    /**
     * Creates a new session
     *
     * @param {string} sessionName - The user input name of the new session
     * @param {string} userId - The id of the user that is attempting to create the session. Will be set as the owner of the session
     * @param {string} bookId - The id of the book being to be viewed in the session.
     * @param {sessionsCallback} callback - A callback to run after database access.
     */
    function createSession(sessionName, userId, bookId, callback) {
        var newSession = new models.Sessions({
            name: sessionName,
            owner: userId,
            currentPageNum: 0,
            currentBook: bookId,
            users: [{
                user_id: userId
            }]
        });
        newSession.save(function (err, result) {
            //Get currentBook _id and title to return
            result.populate({
                path: "currentBook",
                select: "_id title"
            }, function (err, result) {
                callback(err, result);
                //Only notify users if new session creation was successful
                if (!err && webSockets) {
                    webSockets.notifyAllConnectedUsers({
                        type: "newsessioncreated",
                        success: true,
                        result: result
                    });
                }
            });
        });
    }

    /**
     * Removes the specified user from the specified Session in MongoDB
     *
     * @param {String} sessionId - The id of the session that the user wants to leave
     * @param {String} userId - The id of the user that wants to leave the session
     * @param {sessionsCallback} callback - A callback to run after database access.
     */
    function removeUserFromSession(sessionId, userId, callback) {
        var foundSession = models.Sessions.findOne({
            "_id": sessionId
        }).exec(function (err, result) {
            if (err) {
                callback(err, result);
            } else if (!result) {
                //If not result return
                callback(err, result);
            } else {
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
                }, function (err, result) {
                    if (err || !result) {
                        callback(err, result);
                    } else {
                        if (result.users.length == 0) {
                            result.remove(callback);
                        } else {
                            callback(err, result);
                        }
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
        }).exec(function (err, sessions) {
            sessions.forEach(function (session) {
                if (session.users.length > 1) {
                    models.Sessions.findOneAndUpdate(session._id, {
                        $pull: {
                            users: {
                                user_id: userId
                            }
                        }
                    }, function (err, result) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log(`User ${userId} has been removed from Session ${result._id}`);
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
     *Get all users in a given session
     *
     * @param {String} sessionId ID of the session to retrieve the users from
     * @param {Integer} pageNum Number of the page to navigate to
     * @param {Function} callback to execute after users have been retrieved
     */
    var changeSessionPage = function (sessionId, pageNum, callback) {
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
        }, function (err, result) {
            result.populate({
                path: "currentBook",
                select: "_id title"
            }, function (err, result) {
                callback(err, result);
                if (!err && webSockets) {
                    webSockets.notifyUsers(result.users, {
                        type: "pagechanged",
                        success: true,
                        result: result
                    });
                }
            });
        });
    };

    /**
     *Get all users in a given session
     *
     * @param {String} sessionId ID of the session to retrieve the users from
     * @param {Function} callback to execute after users have been retrieved
     */
    var getSessionUsers = function (sessionId, callback) {
        models.Sessions.findOneAndUpdate({
            _id: sessionId
        }, "users", function (err, result) {
            if (err) {
                console.log(err);
            } else {
                callback(result);
            }
        })
    }

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
        getAllSessions: getAllSessions,
        getSessionById: getSessionById,
        joinSession: joinSession,
        createSession: createSession,
        removeUserFromSession: removeUserFromSession,
        removeUserFromAllSessions: removeUserFromAllSessions,
        changeSessionPage: changeSessionPage,
        getSessionUsers: getSessionUsers,
        setMongooseModels: setMongooseModels,
        setWebSockets: setWebSockets
    };