/**
 * @classdesc Container that that is used to access other singlton classes.
 * Also handles general functions that affect multiple classes like websocket messages
 *  
 * @class
 * @hideconstructor
 */
const CollabBookReader = (function () { // eslint-disable-line no-unused-vars

    var websocket = null; //Websocket for receiving data from server
    var sessions = Sessions; //Sessions object for performing operations on Sessions
    var books = Books; //Books object for performing operations on Books

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
        }
    }
    /**
     * Close websocket and set to null
     * 
     * @memberof CollabBookReader
     */
    function stopWebSocketConnection() {
        //Only close the websocket if it exists
        if (websocket) {
            websocket.close();
            websocket = null;
        }
    }
    /**
     * Handle the messages sent to the websocket
     * 
     * @param message - Recieved message
     * @memberof CollabBookReader
     */
    function handleWebSocketMessage(message) {
        var messageData = JSON.parse(message.data);
        console.log(messageData);

        switch (messageData.type) {
            // Message received containing our unique client id
            case "connected":
                sessions.setCurrentUserId(messageData.clientId);
                books.setCurrentUserId(messageData.clientId);
                break;
                //Message received containing the list of all available sessions
            case "allsessions":
                if (messageData.success) {
                    sessions.setAvailableSessions(messageData.result);
                }
                break;
                //Message received when another session is created (either by us or by another user)
            case "newsessioncreated":
                if (messageData.success) {
                    sessions.pushAvailableSession(messageData.result);
                }
                break;
                //Message received when a session is no longer available
            case "sessionremoved":
                sessions.removeAvailableSession(messageData.result.sessionId);
                break;
                //Message received when the page in the current session has changed
            case "pagechanged":
                books.getSessionBookPage(messageData.result);
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

    return {
        getSessions: getSessions,
        getBooks: getBooks,
        startWebSocketConnection: startWebSocketConnection,
        stopWebSocketConnection: stopWebSocketConnection
    };
})();