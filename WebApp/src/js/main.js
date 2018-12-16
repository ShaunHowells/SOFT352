//Start the websocket connection
CollabBookReader.startWebSocketConnection();

//Retrieve book list
CollabBookReader.getBooks().retrieveBookList();

//When document is ready
$(document).ready(function () {
    //Hide currentUserSessionDetails - As we've just joined, we won't be in a session
    $("#currentUserSessionDetails").hide();

    
});