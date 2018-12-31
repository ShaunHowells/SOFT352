/**
 * Routing for Sessions. All requests routed through SessionsRouting take the form /sessions/*
 * @module SessionsRouting
 */

var express = require("express");

module.exports = function(app, test) {
    //Set up router for /sessions
    var sessionsRouter = express.Router();

    //Include sessiondb access
    var sessionsdb = require("./sessionsdb.js");

    sessionsRouter.use(function(request, response, next) {
        response.setHeader("Content-Type", "application/json");
        response.setHeader("Access-Control-Allow-Origin", "*");
        next();
    });
    /**
     * Retrieves the list of available sessions
     * 
     * @name POST/sessions/getallsessions
     * @function
     */
    sessionsRouter.post("/getallsessions", function(request, response) {
        //Get all sessions
        sessionsdb.getAllSessions(function(err, result) {
            if (err) {
                //If an error has occured then write to console and inform caller of error
                console.log(`Error in getAllSessions: ${err}`);
                response.send({
                    success: false,
                    message: "An error has occured trying to get all of the sessions. Please try again."
                });
            } else {
                //If successful then return result to caller
                response.send({
                    success: true,
                    result: result
                });
            }
        });
    });
    /**
     * Joins a user to a session
     * 
     * @name POST/sessions/joinsession
     * @function
     * @param {string} sessionId - The ID of the session the user is join
     * @param {object} user - The details of the user joining the session
     * @param {string} user.userId - The ID of the user joining the session
     * @param {string} user.username - The name of the user joining the session
     */
    sessionsRouter.post("/joinsession", function(request, response) {
        var sessionId = request.body.sessionId; //ID of the session to join
        var user = request.body.user; //The details of the user who wants to join the session

        //Check all required values have been supplied
        if (!sessionId) {
            response.send({
                success: false,
                message: "You must supply a sessionId"
            });
        } else if (!user || !user.userId || !user.username) {
            response.send({
                success: false,
                message: "You must supply a userId and a username"
            });
        } else {
            //Have user join session
            sessionsdb.joinSession(sessionId, user, function(err, result) {
                if (err) {
                    //If an error has occured then write to console and inform caller of error
                    console.log(`Error in joinSession: ${err}`);
                    response.send({
                        success: false,
                        message: "An error has occured attempting to join that session. Please try again."
                    });
                } else if (!result) {
                    //If database access successful, but no result found with the provided information then inform user
                    response.send({
                        success: false,
                        message: "No session with that id found."
                    });
                } else {
                    //If successful then return result to caller
                    console.log(`User: ${user.userId} joined Session: ${result._id}`);
                    response.send({
                        success: true,
                        result: result
                    });
                }
            });
        }
    });
    /**
     * Creates a new session and joins the user creating the session to that session
     * 
     * @name POST/sessions/createsession
     * @function
     * @param {string} sessionName - The name of the session being created
     * @param {object} user - The details of the user creating the session
     * @param {string} user.userId - The ID of the user creating the session
     * @param {string} user.username - The name of the user creating the session
     * @param {string} bookId - The ID of the book to be read in the session
     */
    sessionsRouter.post("/createsession", function(request, response) {
        var sessionName = request.body.sessionName; //User friendly name of the session
        var user = request.body.user; //The details of the user creating the session
        var bookId = request.body.bookId; //ID of the book to be loaded into the session

        //Check all required values have been supplied
        if (!sessionName) {
            response.send({
                success: false,
                message: "You must supply a sessionName"
            });
        } else if (!user || !user.userId || !user.username) {
            response.send({
                success: false,
                message: "You must supply a userId and a username"
            });
        } else if (!bookId) {
            response.send({
                success: false,
                message: "You must supply a bookId"
            });
        } else {
            sessionsdb.createSession(sessionName, user, bookId, function(err, result) {
                if (err) {
                    //If an error has occured then write to console and inform caller of error
                    console.log(`Error in createSession: ${err}`);
                    response.send({
                        success: false,
                        message: "An error has occured attempting to create a session. Please try again."
                    });
                } else {
                    //If successful then return result to caller
                    console.log(`User: ${user.userId} created Session: ${result._id}`);
                    response.send({
                        success: true,
                        result: result
                    });
                }
            });
        }
    });
    /**
     * Removes the user from the given session
     * 
     * @name POST/sessions/leavesession
     * @function
     * @param {string} sessionId - The ID of the session the user is leaving
     * @param {string} userId - The ID of the user leaving the session
     */
    sessionsRouter.post("/leavesession", function(request, response) {
        var sessionId = request.body.sessionId; //User friendly name of the session
        var userId = request.body.userId; //ID of the user creating the session

        //Check all required values have been supplied
        if (!sessionId) {
            response.send({
                success: false,
                message: "You must supply a sessionId"
            });
        } else if (!userId) {
            response.send({
                success: false,
                message: "You must supply a userId"
            });
        } else {
            sessionsdb.removeUserFromSession(sessionId, userId, function(err, result) {
                if (err) {
                    //If an error has occured then write to console and inform caller of error
                    console.log(`Error in removeUserFromSession: ${err}`);
                    response.send({
                        success: false,
                        message: "An error has occured attempting to get leave this session. Please try again."
                    });
                } else if (!result) {
                    //If database access successful, but no result found with the provided information then inform user
                    response.send({
                        success: false,
                        message: "No session with that id found."
                    });
                } else {
                    //If successful then return result to caller
                    console.log(`User: ${userId} has left Session: ${sessionId}`);
                    response.send({
                        success: true,
                        result: result
                    });
                }
            });
        }
    });
    /**
     * Updates the current page being read in the session
     * 
     * @name POST/sessions/updatecurrentpage
     * @function
     * @param {string} sessionId - The ID of the session that the page is being updated in.
     * @param {number} pageNum - The new page number that the session will be reading. Starts at 0.
     * @param {string} userId - The ID of the user updating the page number
     */
    sessionsRouter.post("/updatecurrentpage", function(request, response) {
        var sessionId = request.body.sessionId; //User friendly name of the session
        var pageNum = request.body.pageNum; //ID of the user creating the session
        var userId = request.body.userId; //ID of the user creating the session

        //Check all required values have been supplied
        if (!sessionId) {
            response.send({
                success: false,
                message: "You must supply a sessionId"
            });
        } else if (pageNum == null) {
            response.send({
                success: false,
                message: "You must supply a pageNum"
            });
        } else if (!userId) {
            response.send({
                success: false,
                message: "You must supply a userId"
            });
        } else {
            sessionsdb.changeSessionPage(sessionId, pageNum, userId, function(err, result) {
                if (err) {
                    //If an error has occured then write to console and inform caller of error
                    console.log(`Error in changeSessionPage: ${err}`);
                    response.send({
                        success: false,
                        message: "An error has occured attempting to get change the page of this session. Please try again."
                    });
                } else if (!result) {
                    //If database access successful, but no result found with the provided information then inform user
                    response.send({
                        success: false,
                        message: "No session with that id found."
                    });
                } else {
                    //If successful then return result to caller
                    response.send({
                        success: true,
                        result: result
                    });
                }
            });
        }

    });

    //This should only be used to clean up after the cucumber-js tests have run, so only set this up in test mode
    if (test) {
        sessionsRouter.post("/closeallsessions", function(request, response) {
            sessionsdb.closeAllSessions(function(err) {
                if (err) {
                    //If an error has occured then write to console and inform caller of error
                    console.log(`Error in closeAllSessions: ${err}`);
                    response.send({
                        success: false,
                        message: "An error has occured attempting to close all sessions. Please try again."
                    });
                } else {
                    //If successful then return result to caller
                    response.send({
                        success: true,
                        result: null
                    });
                }
            });
        });
    }

    app.use("/sessions", sessionsRouter);

    return {
        sessionsdb: sessionsdb
    };
};