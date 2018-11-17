MainApp.getInstance().controller("availableSessionsCtrl", function ($scope) {
    $scope.availableSessions = [{
            owner: 'Shaun',
            name: 'My Test Session',
            id: 1
        },
        {
            owner: 'John',
            name: "I'm over here!",
            id: 2
        }, {
            owner: 'Shaun',
            name: 'My Test Session',
            id: 1
        },
        {
            owner: 'John',
            name: "I'm over here!",
            id: 2
        }
    ];
}).controller("mySessionsCtrl", function ($scope) {
    $scope.mySessions = [{
            owner: 'Shaun',
            name: 'My Active Session 1',
            id: 1
        },
        {
            owner: 'John',
            name: "My Active Session 2",
            id: 2
        }
    ];
});

$(document).ready(function () {
    $(".list-group-item").click(function (event) {
        $(".list-group-item").removeClass("active");
        $(this).addClass("active");
    });
});