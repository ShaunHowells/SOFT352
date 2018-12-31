/**
 * Routing for Notes. All requests routed through NotesRouting take the form /notes/*
 * @module NotesRouting
 */

var express = require("express");

module.exports = function(app) {
    //Set up router for /chat
    const notesRouter = express.Router();

    //Include sessiondb access
    var notesdb = require("./notesdb.js");

    notesRouter.use(function(request, response, next) {
        response.setHeader("Content-Type", "application/json");
        response.setHeader("Access-Control-Allow-Origin", "*");
        next();
    });
    /**
     * Adds a new note to a session
     * 
     * @name POST/notes/addnewnote
     * @function
     * @param {string} sessionId - The ID of the session to add the note to
     * @param {string} userId - The ID of the user adding the note
     * @param {string} note - The contents of the note
     * @param {number} pageNum - The number of the page the note is being added to. Starts at 0.
     */
    notesRouter.post("/addnewnote", function(request, response) {
        var sessionId = request.body.sessionId; //ID of the session the note is being added to
        var userId = request.body.userId; //ID of the user sending the note
        var note = request.body.note; //The contents of the note
        var pageNum = request.body.pageNum; //The number of the page the note relates to

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
        } else if (!note) {
            response.send({
                success: false,
                message: "You must supply a note"
            });
        } else if (pageNum == null) {
            response.send({
                success: false,
                message: "You must supply a note"
            });
        } else {
            //Send chat message to all users in the session
            notesdb.addNoteToSession(sessionId, userId, note, pageNum, function(err, result) {
                if (err) {
                    //If an error has occured then write to console and inform caller of error
                    console.log(`Error in addNoteToSession: ${err}`);
                    response.send({
                        success: false,
                        message: "An error has occured attempting to add that note. Please try again."
                    });
                } else if (!result) {
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
    /**
     * Deletes a note from a session
     * 
     * @name POST/notes/deletenote
     * @function
     * @param {string} sessionId - The ID of the session the note is being deleted from
     * @param {string} noteId - The ID of the note being deleted
     * @param {string} userId - The ID of the user deleting the note
     */
    notesRouter.post("/deletenote", function(request, response) {
        var sessionId = request.body.sessionId; //ID of the session the note belongs to
        var noteId = request.body.noteId; //ID of the note to be delete
        var userId = request.body.userId; //ID of the user doing the deleting

        //Check all required values have been supplied
        if (!sessionId) {
            response.send({
                success: false,
                message: "You must supply a sessionId"
            });
        } else if (!noteId) {
            response.send({
                success: false,
                message: "You must supply a noteId"
            });
        } else if (!userId) {
            response.send({
                success: false,
                message: "You must supply a userId"
            });
        } else {
            //Send chat message to all users in the session
            notesdb.removeNoteFromSession(sessionId, noteId, userId, function(err, result) {
                if (err) {
                    //If an error has occured then write to console and inform caller of error
                    console.log(`Error in removeNoteFromSession: ${err}`);
                    response.send({
                        success: false,
                        message: "An error has occured attempting to remove that note. Please try again."
                    });
                } else if (!result) {
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
    /**
     * Retrieves all of the notes from a session
     * 
     * @name POST/notes/getallsessionnotes
     * @function
     * @param {string} sessionId - The ID of the session to retrieve the notes from
     * @param {string} userId - The ID of the user retrieving the notes
     */
    notesRouter.post("/getallsessionnotes", function(request, response) {
        var sessionId = request.body.sessionId; //ID of the session the chat message is being sent in
        var userId = request.body.userId; //ID of the user sending the message

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
            //Send chat message to all users in the session
            notesdb.getAllSessionNotes(sessionId, userId, function(err, result) {
                if (err) {
                    //If an error has occured then write to console and inform caller of error
                    console.log(`Error in getAllSessionNotes: ${err}`);
                    response.send({
                        success: false,
                        message: "An error has occured attempting to retrieve the session notes. Please try again."
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

    app.use("/notes", notesRouter);

    return {
        notesdb: notesdb
    };
};