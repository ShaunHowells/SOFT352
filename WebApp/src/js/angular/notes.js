AngularMainApp.controller("noteListCtrl", function($scope) {
    $scope.noteList = [];

    //Set noteList to update the display
    $scope.setNoteList = function(data) {
        $scope.noteList = data;
        $scope.refreshNoteList();
    };
    //Set $scope.setAvailableSessions as callback in CollabBookReader.getSessions() - Called when availableSession list is updated
    CollabBookReader.getNotes().getNoteObserver().subscribe($scope.setNoteList);

    $scope.refreshNoteList = function() {
        if(CollabBookReader.getBooks().getCurrentBookPage() && CollabBookReader.getBooks().getCurrentBookPage()._id){
            angular.element("#notesDisplay").show();
        } else {
            angular.element("#notesDisplay").hide();
        }
        $scope.currentPageNum = CollabBookReader.getBooks().getCurrentBookPage().currentPage.pageNum
        $scope.currentPageNoteList = $scope.noteList.filter(function(value) {
            return value.pageNum == $scope.currentPageNum;
        });
        $scope.$apply();
    }
    CollabBookReader.getBooks().getUpdatePageBookObserver().subscribe($scope.refreshNoteList);

    //Send user input chat message and clear display
    $scope.createNote = function() {
        var newNotePageNum = angular.element("#createNewNotePageNum").val();
        var newNoteDetails = angular.element("#createNewNoteDetails").val();
        //Check that all values have been supplied
        if (!newNotePageNum) {
            alert("Please enter the number of the page for your note");
        } else if (!newNoteDetails) {
            alert("Please the details of your note");
        } else {
            //-1 to translate between 0 indexed and 1 indexed
            newNotePageNum -= 1;
            if (CollabBookReader.getSessions().getCurrentUserSession()) {
                CollabBookReader.getNotes().createNewNote(newNotePageNum, newNoteDetails, function(data) {
                    //Hide create new session modal
                    $("#createNewNoteModalClose").click();
                });
            } else {
                alert("You aren't currently in a session");
            }
        }
    };
    $scope.displayCreateNewNoteDetails = function() {
        //Reset values before displaying
        $("#createNewNoteModal").find("input, textarea").val("");
        $("#createNewNoteModal").modal();
    }

    $scope.checkInSession = function() {
        return (CollabBookReader.getSessions().getCurrentUserSession()._id != null);
    }
});