/**
 * @classdesc Container that that is used to access other singlton classes.
 * Also handles general functions that affect multiple classes like websocket messages
 *  
 * @class
 * @hideconstructor
 */
const CollabBookReader = (function() { // eslint-disable-line no-unused-vars

    var websocket = null; //Websocket for receiving data from server
    var sessions = Sessions; //Sessions object for performing operations on Sessions
    var books = Books; //Books object for performing operations on Books
    var chat = Chat; //Chat object for performing operations on Books
    var notes = Notes; //Notes object for performing operations on Notes
    var users = Users; //Users object for performing opersations on Users

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
            }
        }
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
                sessions.setCurrentUserId(messageData.clientId);
                books.setCurrentUserId(messageData.clientId);
                break;
                //Message received containing the list of all available sessions
            case "allsessions":
                sessions.setAvailableSessions(messageData.result);
                break;
                //Message received when another session is created (either by us or by another user)
            case "newsessioncreated":
                sessions.pushAvailableSession(messageData.result);
                break;
                //Message received when a session is no longer available
            case "sessionremoved":
                sessions.removeAvailableSession(messageData.result.sessionId);
                break;
                //Message received when the page in the current session has changed
            case "pagechanged":
                books.getSessionBookPage(messageData.result);
                break;
            case "chatmessagereceived":
                chat.addChatMessage(messageData.result);
                break;
            case "userjoinedsession":
                chat.addChatMessage({
                    user: messageData.user.username,
                    message: messageData.user.username + " has joined the session",
                    notification: true
                });
                users.addUser(messageData.user);
                break;
            case "userleftsession":
                chat.addChatMessage({
                    user: messageData.user.username,
                    message: messageData.user.username + " has left the session",
                    notification: true
                });
                users.removeUser(messageData.user._id);
                break;
            case "newnoteadded":
                notes.addNote(messageData.note);
                break;
            case "noteremoved":
                notes.removeNote(messageData.noteId);
                break;
            default:
                break;
        }
    }

    /**
     * Returns Sessions object
     * 
     * @returns {Sessions} Sessions Singleton Class
     * @memberof CollabBookReader
     */
    function getSessions() {
        return sessions;
    }

    /**
     * Returns Books object
     * 
     * @returns {Books} Books Singleton Class
     * @memberof CollabBookReader
     */
    function getBooks() {
        return books;
    }

    /**
     * Returns Chat object
     * 
     * @returns {Chat} Chat Singleton Class
     * @memberof CollabBookReader
     */
    function getChat() {
        return chat;
    }

    /**
     * Returns Notes object
     * 
     * @returns {Notes} Notes Singleton Class
     * @memberof CollabBookReader
     */
    function getNotes() {
        return notes;
    }

    /**
     * Returns Users object
     * 
     * @returns {Users} Users Singleton Class
     * @memberof CollabBookReader
     */
    function getUsers() {
        return users;
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
     * @returns {Users} Users Singleton Class
     * @memberof CollabBookReader
     */
    function getUsername() {
        return username;
    }
    /**
     * Returns the username
     * 
     * @returns {Observer} Observer for WebSocket messages
     * @memberof CollabBookReader
     */

    function getWebSocketMessageObserver() {
        return webSocketMessageObserver;
    }

    return {
        getSessions,
        getBooks,
        getChat,
        getNotes,
        getUsers,
        setUsername,
        getUsername,
        startWebSocketConnection,
        getWebSocketMessageObserver
    };
})();