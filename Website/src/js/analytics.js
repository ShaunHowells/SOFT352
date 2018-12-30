//Called when server initially sends back available sessions
//Used in combination with bookServerConnectionTiming
function sessionServerConnectionTiming() {
    //Check that the websocket is active, otherwise this may be called by the unit tests
    if (CollabBookReader.isWebSocketActive()) {
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
}
//Called when the server initially sends back bookList
//Used in combination with sessionServerConnectionTiming
function bookServerConnectionTiming() {
    //Check that the websocket is active, otherwise this may be called by the unit tests
    if (CollabBookReader.isWebSocketActive()) {
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
}

//Log performance metrics on load
window.onload = function() {
    if ("performance" in window) {
        if ("timing" in window.performance) {
            console.log("Page Performance API supported");
            console.log("Total time taken to download the webpage from server is: " + (window.performance.timing.responseEnd - window.performance.timing.navigationStart) + " milliseconds");
            console.log("Total time taken to render the webpage is: " + (window.performance.timing.loadEventStart - window.performance.timing.domLoading) + " milliseconds");
        }
    }
};

//When an ajax request is complete log this event to Google Analytics
$(document).on("ajaxComplete", function(event, request, settings) {
    gtag("event", "Website", {
        event_category: "AJAX",
        event_label: settings.url,
        nonInteractive: true
    });
});

//A function to record websocket message types for Google Analytics
function googleAnalyticsWebSocketEvent(message) {
    gtag("event", "Website", {
        event_category: "WebSocket",
        event_label: message.type,
        nonInteractive: true
    });
}

$(document).ready(function() {
    //Add the Google Analytics function to the websocket message observer to record events
    CollabBookReader.getWebSocketMessageObserver().subscribe(googleAnalyticsWebSocketEvent);
    //Add server connection timers to the observers
    CollabBookReader.getSessions().getAvailableSessionsObserver().subscribe(sessionServerConnectionTiming);
    CollabBookReader.getBooks().getBookListObserver().subscribe(bookServerConnectionTiming);

    if (typeof(QUnit) != "undefined") {
        QUnit.done(function(details) {
            console.log("Total time taken to perform QUnit tests is: " + details.runtime + " milliseconds");
        });
    }
});