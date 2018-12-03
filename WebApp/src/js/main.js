
var sessions = new Sessions();
CollabBookReader.setSessions(sessions);
//CollabBookReader.startWebSocketConnection();


$(document).ready(function () {
    $(document).on("click", ".list-group-item", function (event) {
        // $(".list-group-item").removeClass("active");
        // $(this).addClass("active");
    });
});