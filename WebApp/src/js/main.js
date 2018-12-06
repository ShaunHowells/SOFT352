//Start the websocket connection
CollabBookReader.startWebSocketConnection();

//When document is ready
$(document).ready(function () {
    //Hide currentUserSessionDetails - As we've just joined, we won't be in a session
    $("#currentUserSessionDetails").hide();
});