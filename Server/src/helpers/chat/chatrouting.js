/**
 * Routing for Chat. All requests routed through ChatRouting take the form /chat/*
 * @module ChatRouting
 */

var express = require("express");

module.exports = function(app) {
    //Set up router for /chat
    const chatRouter = express.Router();

    //Include sessiondb access
    var chatdb = require("./chatdb.js");

    chatRouter.use(function(request, response, next) {
        response.setHeader("Content-Type", "application/json");
        response.setHeader("Access-Control-Allow-Origin", "*");
        next();
    });
    /**
     * Send a chat message to all users in the users current session
     * 
     * @name POST/chat/sendchatmessage
     * @function
     * @param {string} sessionId - The ID of the session to send the message in
     * @param {string} userId - The ID of the user sending the message
     * @param {string} message - The message being sent
     */
    chatRouter.post("/sendchatmessage", function(request, response) {
        var sessionId = request.body.sessionId; //ID of the session the chat message is being sent in
        var userId = request.body.userId; //ID of the user sending the message
        var message = request.body.message; //The contents of the message

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
        } else if (!message) {
            response.send({
                success: false,
                message: "You must supply a message"
            });
        } else {
            //Send chat message to all users in the session
            chatdb.sendChatMessage(sessionId, userId, message, function(err, result) {
                if (err) {
                    //If an error has occured then write to console and inform caller of error
                    console.log(`Error in sendChatMessage: ${err}`);
                    response.send({
                        success: false,
                        message: "An error has occured attempting to send that message. Please try again."
                    });
                } else if (!result) {
                    response.send({
                        success: false,
                        message: "A session with this ID does not exist"
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

    app.use("/chat", chatRouter);

    return {
        chatdb: chatdb
    };
};