var CollabBookReader = (function () {
    this.websocket = null;
    this.sessions = new Sessions();
    this.books = new Books();
    this.clientId = null;

    function startWebSocketConnection() {
        if (!websocket) {
            websocket = new WebSocket("ws://localhost:9000");

            websocket.onmessage = handleWebSocketMessage.bind(this);
        }
    }

    function stopWebSocketConnection() {
        if (websocket) {
            websocket.close();
            websocket = null;
        }
    }

    function handleWebSocketMessage(message) {
        var messageData = JSON.parse(message.data);
        console.log(messageData);

        switch (messageData.type) {
            case "connected":
                sessions.currentUserId = messageData.clientId;
                break;
            case "allsessions":
                if (messageData.success) {
                    sessions.setAvailableSessions(messageData.result);
                }
                break;
            case "newsessioncreated":
                if (messageData.success) {
                    sessions.pushAvailableSession(messageData.result);
                }
                break;
            case "sessionremoved":
                sessions.removeAvailableSession(messageData.result.sessionId);
                break;
            default:
                break;
        }
    }

    function getSessions() {
        return sessions;
    }

    function getBooks() {
        return books;
    }

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