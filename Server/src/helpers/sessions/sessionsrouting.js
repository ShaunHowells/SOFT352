var express = require("express");

module.exports = function (app, webSockets) {
    //Set up router for /sessions
    var sessionsRouter = express.Router();

    //Include sessiondb access
    var sessionsdb = require("./sessionsdb.js");

    sessionsRouter.post("/getallsessions", function (request, response) {
        //Get all sessions
        sessionsdb.getAllSessions(function (err, result) {
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

    sessionsRouter.post("/getsessionbyid", function (request, response) {
        var sessionId = request.body.sessionId; //ID of the session to retrieve

        //Get session by its id
        sessionsdb.getSessionById(sessionId, function (err, result) {
            if (err) {
                //If an error has occured then write to console and inform caller of error
                console.log(`Error in getSessionById: ${err}`);
                response.send({
                    success: false,
                    message: "An error has occured attempting to get that session. Please try again."
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
    });

    sessionsRouter.post("/joinsession", function (request, response) {
        var sessionId = request.body.sessionId; //ID of the session to join
        var userId = request.body.userId; //ID of the user who wants to join the session

        //Have user join session
        sessionsdb.joinSession(sessionId, userId, function (err, result) {
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
                console.log(`User: ${userId} joined Session: ${result._id}`);
                response.send({
                    success: true,
                    result: result
                });
            }
        });
    });

    sessionsRouter.post("/createsession", function (request, response) {
        var sessionName = request.body.sessionName; //User friendly name of the session
        var userId = request.body.userId; //ID of the user creating the session
        var bookId = request.body.bookId; //ID of the book to be loaded into the session

        sessionsdb.createSession(sessionName, userId, bookId, function (err, result) {
            if (err) {
                //If an error has occured then write to console and inform caller of error
                console.log(`Error in createSession: ${err}`);
                response.send({
                    success: false,
                    message: "An error has occured attempting to create a session. Please try again."
                });
            } else {
                //If successful then return result to caller
                console.log(`Session: ${result._id} created`);
                response.send({
                    success: true,
                    result: result
                });
            }
        });
    });

    sessionsRouter.post("/getusersessions", function (request, response) {
        var sessionName = request.body.sessionName; //User friendly name of the session
        var userId = request.body.userId; //ID of the user creating the session

        sessionsdb.getUserSessions(userId, function (err) {
            if (err) {
                //If an error has occured then write to console and inform caller of error
                console.log(`Error in getUserSessions: ${err}`);
                response.send("An error has occured attempting to get user sessions. Please try again.")
            } else {
                //If successful then return result to caller
                console.log(`Session: ${result._id} created`);
                response.send(result);
            }
        });
    });

    sessionsRouter.use(function (request, response, next) {
        response.setHeader("Content-Type", "application/json");
        next();
    });
    app.use("/sessions", sessionsRouter);

    return {
        sessionsdb: sessionsdb
    }
};