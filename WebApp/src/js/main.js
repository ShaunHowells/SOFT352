
var sessions = new Sessions();
CollabBookReader.setSessions(sessions);
CollabBookReader.startWebSocketConnection();


$(document).ready(function () {
    $(".list-group-item").click(function (event) {
        $(".list-group-item").removeClass("active");
        $(this).addClass("active");
    });
});