//Start the websocket connection
CollabBookReader.startWebSocketConnection();

//Retrieve book list
CollabBookReader.getBooks().retrieveBookList();

//When document is ready
$(document).ready(function() {
    //Hide currentUserSessionDetails - As we've just joined, we won't be in a session
    $("#currentUserSessionDetails").hide();
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

function setUsername() {
    if (validUsernameForm()) {
        var username = $("#inputUsername").val();
        CollabBookReader.setUsername(username);
        $("#inputUsername").val("");
        $("#usernameModal").modal("hide");
    }
}

function validUsernameForm() {
    var form = document.getElementById("usernameForm");
    var valid = form.checkValidity();
    form.classList.add("was-validated");

    return valid;
}