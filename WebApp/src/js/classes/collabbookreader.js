/**
 * CollabBookReader - Container that that is used to access instances of other class
 * Also handles general functions that affect multiple classes like websocket messages
 */
const CollabBookReader = (function () { // eslint-disable-line no-unused-vars

    var websocket = null; //Websocket for receiving data from server
    var sessions = Sessions; //Sessions object for performing operations on Sessions
    var books = Books; //Books object for performing operations on Books
    var clientId = null; //Client id received from the server - Used to uniquely identify the current user

    /**
     * startWebSocketConnection - Initialise websocket, connect to server, and set onmessage
     */
    function startWebSocketConnection() {
        //Don't recreate the websocket if it already exists
        if (!websocket) {
            websocket = new WebSocket("ws://localhost:9000");
            websocket.onmessage = handleWebSocketMessage;
        }
    }
    /**
     * stopWebSocketConnection - Close websocket and set to null
     */
    function stopWebSocketConnection() {
        //Only close the websocket if it exists
        if (websocket) {
            websocket.close();
            websocket = null;
        }
    }
    /**
     * handleWebSocketMessage - Handle the messages sent to the websocket
     * 
     * @param message - Recieved message
     */
    function handleWebSocketMessage(message) {
        var messageData = JSON.parse(message.data);
        console.log(messageData);

        switch (messageData.type) {
        // Message received containing our unique client id
        case "connected":
            sessions.currentUserId = messageData.clientId;
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
        default:
            break;
        }
    }

    /**
     * getSessions - returns Sessions object
     * 
     * @returns {Sessions}
     */
    function getSessions() {
        return sessions;
    }

    /**
     * getBooks - returns Books object
     * 
     * @returns {Books}
     */
    function getBooks() {
        return books;
    }

    /**
     * getClientId - returns unique client id
     * 
     * @returns {String}
     */
    function getClientId() {
        return clientId;
    }

    return {
        getSessions: getSessions,
        getBooks: getBooks,
        startWebSocketConnection: startWebSocketConnection,
        stopWebSocketConnection: stopWebSocketConnection,
        getClientId: getClientId
    };
})();