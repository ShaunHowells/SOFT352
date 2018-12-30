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

//Called when server initially sends back available sessions
//Used in combination with bookServerConnectionTiming
function sessionServerConnectionTiming() {
    //Ensure this is only called once
    CollabBookReader.getSessions().getAvailableSessionsObserver().unsubscribe(sessionServerConnectionTiming);
    //If this is the first time this is called, then set
    if (window.shaun_ServerConnectionReceived) {
        //Output time to receive all initial information from the server
        console.log("Total time taken to connect to the server and receive all initial data: " + (performance.now() - window.shaun_serverConnectionTimingStart) + " milliseconds");
        delete window.shaun_ServerConnectionReceived;
        delete window.shaun_serverConnectionTimingStart;
    } else {
        //We are the first response, so set flag to true so next functions knows to stop
        window.shaun_ServerConnectionReceived = true;
    }
}
//Called when the server initially sends back bookList
//Used in combination with sessionServerConnectionTiming
function bookServerConnectionTiming() {
    //Ensure this is only called once
    CollabBookReader.getBooks().getBookListObserver().unsubscribe(bookServerConnectionTiming);
    //If this is the first time this is called, then set
    if (window.shaun_ServerConnectionReceived) {
        //Output time to receive all initial information from the server
        console.log("Total time taken to connect to the server and receive all initial data: " + (performance.now() - window.shaun_serverConnectionTimingStart) + " milliseconds");
        delete window.shaun_ServerConnectionReceived;
        delete window.shaun_serverConnectionTimingStart;
    } else {
        //We are the first response, so set flag to true so next functions knows to stop
        window.shaun_ServerConnectionReceived = true;
    }
}

//Log performance metrics on load
window.onload = function() {
    if ("performance" in window) {
        if ("timing" in window.performance) {
            console.log("Page Performance API supported");
            console.log("Total  time taken to download the webpage from server is : " + (window.performance.timing.responseEnd - window.performance.timing.navigationStart) + " milliseconds");
            console.log("Total  time taken to render the webpage  is : " + (window.performance.timing.loadEventStart - window.performance.timing.domLoading) + " milliseconds");
        }
    }
};