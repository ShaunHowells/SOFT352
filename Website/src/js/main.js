//When document is ready
$(document).ready(function() {
    //Hide currentUserSessionDetails - As we've just joined, we won't be in a session
    $("#currentUserSessionDetails").hide();
    $("#chatInputMessage").attr("disabled", true);
    $("#createNewNote").attr("disabled", true);
    $("#inputUsername").on("keypress", function(event) {
        if (event.charCode == 13) {
            setUsername();
        }
    });
    $("#usernameModal").modal({
        "backdrop": "static",
        "keyboard": false
    });
});

//Set the username of the current user and starts the connection to the server
function setUsername() {
    if (validUsernameForm()) {
        var username = $("#inputUsername").val();
        CollabBookReader.setUsername(username);
        $("#inputUsername").val("");
        $("#usernameModal").modal("hide");

        startServerConnection();
    }
}

//Starts the WebSocket connection to the server
function startServerConnection() {
    //Start connecting to the server after we've been provided with a username
    //Start the websocket connection
    window.shaun_serverConnectionTimingStart = performance.now();

    CollabBookReader.getSessions().getAvailableSessionsObserver().subscribe(sessionServerConnectionTiming);
    CollabBookReader.getBooks().getBookListObserver().subscribe(bookServerConnectionTiming);
    CollabBookReader.startWebSocketConnection();
    //Retrieve book list
    CollabBookReader.getBooks().retrieveBookList();
}

//Validate usernameForm
function validUsernameForm() {
    var form = document.getElementById("usernameForm");
    var valid = form.checkValidity();
    form.classList.add("was-validated");

    return valid;
}