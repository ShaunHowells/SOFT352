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
        if (CollabBookReader.getBooks().getCurrentBookPage() && CollabBookReader.getBooks().getCurrentBookPage()._id) {
            angular.element("#notesDisplay").show();
        } else {
            angular.element("#notesDisplay").hide();
        }
        $scope.currentPageNum = CollabBookReader.getBooks().getCurrentBookPage().currentPage.pageNum;
        $scope.currentPageNoteList = $scope.noteList.filter(function(value) {
            return value.pageNum == $scope.currentPageNum;
        });
        $scope.$apply();
    };
    CollabBookReader.getBooks().getUpdatePageBookObserver().subscribe($scope.refreshNoteList);

    //Send user input chat message and clear display
    $scope.createNote = function() {
        if (validCreateNoteForm()) {
            var newNotePageNum = angular.element("#createNewNotePageNumList").val();
            var newNoteDetails = angular.element("#createNewNoteDetails").val();
            //-1 to translate between 0 indexed and 1 indexed
            newNotePageNum -= 1;
            if (CollabBookReader.getSessions().getCurrentUserSession()) {
                CollabBookReader.getNotes().createNewNote(newNotePageNum, newNoteDetails, function() {
                    //Hide create new session modal
                    angular.element("#createNewNoteModalClose").click();
                });
            } else {
                alert("You aren't currently in a session");
            }
        }
    };

    function validCreateNoteForm() {
        var form = document.getElementById("createNoteForm");
        var valid = form.checkValidity();
        form.classList.add("was-validated");

        return valid;
    }

    angular.element("#createNewNoteModal").on("hidden.bs.modal", function() {
        document.getElementById("createNoteForm").classList.remove("was-validated");;
    });

    $scope.noteEnter = function(event) {
        if (event.charCode == 13) {
            $scope.createNote();
        }
    };

    $scope.displayCreateNewNoteDetails = function() {
        //Reset values before displaying
        angular.element("#createNewNoteDetails").val("");
        angular.element("#createNewNotePageNumList").val(CollabBookReader.getBooks().getCurrentBookPage().currentPage.pageNum + 1);
        angular.element("#createNewNoteModal").modal();
    };

    $scope.displayDeleteNote = function(note) {
        //Set values for current note
        $scope.noteToDelete = note;
        angular.element("#deleteNoteModalUser").text(note.user);
        angular.element("#deleteNoteModalPageNum").text(note.pageNum);
        angular.element("#deleteNoteModalDetails").text(note.note);
        angular.element("#deleteNoteModal").modal();
    };

    $scope.deleteNote = function(noteToDelete) {
        //Check that all values have been supplied
        if (!noteToDelete) {
            alert("An error has occured attempting to delete this note");
        } else {
            //-1 to translate between 0 indexed and 1 indexed
            if (CollabBookReader.getSessions().getCurrentUserSession()) {
                CollabBookReader.getNotes().deleteNote(noteToDelete._id, function() {
                    //Hide create new session modal
                    angular.element("#deleteNoteModalClose").click();
                });
            } else {
                alert("You aren't currently in a session");
            }
        }
    };

    $scope.getPageNumArray = function() {
        return Array(CollabBookReader.getBooks().getCurrentBookPage().pageCount).fill().map(function(x, i) {
            return i + 1;
        });

    };
});