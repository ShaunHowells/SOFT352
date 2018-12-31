/**
 * @classdesc Container that that is used to access other singlton classes.
 * Also handles general functions that affect multiple classes like websocket messages
 *  
 * @class
 * @hideconstructor
 */
const CollabBookReader = (function() { // eslint-disable-line no-unused-vars

    var websocket = null; //Websocket for receiving data from server
    var username;

    var webSocketMessageObserver = new Observer();

    /**
     * Initialise websocket, connect to server, and set onmessage
     * 
     * @memberof CollabBookReader
     */
    function startWebSocketConnection() {
        //Don't recreate the websocket if it already exists
        if (!websocket) {
            websocket = new WebSocket("ws://localhost:9000");
            websocket.onmessage = handleWebSocketMessage;

            websocket.onerror = function() {
                $("#noConnectionModal").modal({
                    "backdrop": "static",
                    "keyboard": false
                });
            };

            websocket.onclose = function() {
                $("#noConnectionModal").modal({
                    "backdrop": "static",
                    "keyboard": false
                });
            };
        }
    }

    /**
     * Handle the messages sent to the websocket
     * 
     * @return {boolean} - A boolean indicating if the websocket is active
     * @memberof CollabBookReader
     */
    function isWebSocketActive() {
        return (websocket != null);
    }

    /**
     * Handle the messages sent to the websocket
     * 
     * @param message - Received message
     * @memberof CollabBookReader
     */
    function handleWebSocketMessage(message) {
        var messageData = JSON.parse(message.data);
        webSocketMessageObserver.notify(messageData);

        switch (messageData.type) {
            // Message received containing our unique client id
            case "connected":
                Sessions.setCurrentUserId(messageData.clientId);
                Notes.setCurrentUserId(messageData.clientId);
                break;
                //Message received containing the list of all available Sessions
            case "allsessions":
                Sessions.setAvailableSessions(messageData.result);
                break;
                //Message received when another session is created (either by us or by another user)
            case "newsessioncreated":
                Sessions.pushAvailableSession(messageData.result);
                break;
                //Message received when a session is no longer available
            case "sessionremoved":
                Sessions.removeAvailableSession(messageData.result.sessionId);
                break;
                //Message received when the page in the current session has changed
            case "pagechanged":
                Books.getSessionBookPage(messageData.result);
                break;
            case "chatmessagereceived":
                Chat.addChatMessage(messageData.result);
                break;
            case "userjoinedsession":
                Chat.addChatMessage({
                    user: messageData.user.username,
                    message: messageData.user.username + " has joined the session",
                    notification: true
                });
                Users.addUser(messageData.user);
                break;
            case "userleftsession":
                Chat.addChatMessage({
                    user: messageData.user.username,
                    message: messageData.user.username + " has left the session",
                    notification: true
                });
                Users.removeUser(messageData.user._id);
                break;
            case "newnoteadded":
                Notes.addNote(messageData.note, Sessions.getCurrentUserSession()._id);
                break;
            case "noteremoved":
                Notes.removeNote(messageData.noteId);
                break;
            default:
                break;
        }
    }

    /**
     * Sets the name of the user. This username is used as their display name
     * The username can only be set once.
     * 
     * @memberof CollabBookReader
     */
    function setUsername(inputUsername) {
        if (!username) {
            username = inputUsername;
            $("#spanUsername").text(username);
            $("#displayUsername").removeClass("username-init");
            $("#displayUsername").addClass("username-set");
        } else {
            console.error("Username can only be set once");
        }
    }
    /**
     * Returns the username
     * 
     * @returns {string} - The name of the current user
     * @memberof CollabBookReader
     */
    function getUsername() {
        return username;
    }
    /**
     * Returns the username
     * 
     * @returns {Observer} - Observer for WebSocket messages
     * @memberof CollabBookReader
     */

    function getWebSocketMessageObserver() {
        return webSocketMessageObserver;
    }

    return {
        setUsername,
        getUsername,
        startWebSocketConnection,
        getWebSocketMessageObserver,
        isWebSocketActive
    };
})();