var CollabBookReader = (function () {
    var websocket;
    var sessions;
    var clientId;

    function startWebSocketConnection() {
        this.websocket = new WebSocket("ws://localhost:9000");

        this.websocket.onmessage = handleWebSocketMessage.bind(this);
    }

    function stopWebSocketConnection() {
        if (this.websocket) {
            this.websocket.close();
            this.websocket = null;
        }
    }

    function handleWebSocketMessage(message) {
        var messageData = JSON.parse(message.data);
        console.log(messageData);

        switch (messageData.type) {
            case "connected":
                this.sessions.currentUserId = messageData.clientId;
                break;
            case "allsessions":
                if (messageData.success) {
                    this.sessions.setAvailableSessions(messageData.result);
                }
                break;
            case "newsessioncreated":
                if (messageData.success) {
                    this.sessions.pushAvailableSession(messageData.result);
                }
                break;
            case "sessionremoved":
                    this.sessions.removeAvailableSession(messageData.result.sessionId);
                break;
            default:
                break;
        }
    }

    function setSessions(sessions) {
        if (sessions) {
            this.sessions = sessions;
        }
    }

    function getSessions() {
        return this.sessions;
    }

    function getClientId() {
        return this.clientId;
    }

    return {
        getSessions: getSessions,
        setSessions: setSessions,
        startWebSocketConnection: startWebSocketConnection,
        stopWebSocketConnection: stopWebSocketConnection,
        getClientId: getClientId
    };
})();