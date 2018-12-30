/**
 * @classdesc Handles all of the functionality relating to the handling of multiple 'Notes'.
 * 
 * @class
 * @hideconstructor
 */
var Notes = (function() { // eslint-disable-line no-unused-vars
    var noteList = [];
    var currentUserId;

    var noteObserver = new Observer();

    /**
     * Returns noteObserver
     * 
     * @memberof Notes
     * @return {Observer} Observer for the chat messages
     */
    function getNoteObserver() {
        return noteObserver;
    }

    /**
     * Adds a note to the noteList
     * 
     * @memberof Notes
     * @param {Object} note - The details of the note to add
     */
    function addNote(note) {
        noteList.push(new Note(note));

        noteObserver.notify(noteList);
    }
    /**
     * Create a note for a page in the current session
     * 
     * @memberof Notes
     * @param {String} message
     */
    function createNewNote(pageNum, note, sessionId, userId, callback) {
        $.post("http://localhost:9000/notes/addnewnote", {
            sessionId: sessionId,
            userId: userId,
            note: note,
            pageNum: pageNum
        }).done(function(data) {
            if (!data.success) {
                alert("An error has occured creating this note. Please try again");
                console.log(data);
            } else {
                if (callback)
                    callback(data.result);
            }
        });
    }

    /**
     * Remove all notes from note list
     * 
     * @memberof Notes
     */
    function removeAllNotes(session) {
        if (!session) {
            noteList = [];
            noteObserver.notify(noteList);
        }
    }

    /**
     * Returns noteList
     * 
     * @memberof Notes
     * @returns {Note[]} List of all current notes
     */
    function getNoteList() {
        return noteList;
    }

    /**
     * Sets the list of chat messages
     * 
     * @memberof Notes
     * @param {Object} notes Contains the data for the notes
     */
    function setNoteList(notes) {
        noteList = [];
        for (var note in notes) {
            noteList.push(new Note(notes[note]));
        }

        noteObserver.notify(noteList);
    }


    /**
     * Given a session, decided if we need to retrieve the notes, or clear the current notes
     * 
     * @memberof Notes
     * @param {Session} session A given session 
     */
    function getSessionNotes(session) {
        //If session exists then retrieve notes, otherwise remove all notes
        if (session && !session.test) {
            retrieveAllSessionNotes(session._id, currentUserId, function(data) {
                setNoteList(data.notes, session._id);
            });
        } else {
            removeAllNotes();
        }
    }
    /**
     * Given a session id, retrieve the notes for that saession
     * 
     * @memberof Notes
     * @param {String} sessionId The id of the session whose notes we want to retrieve
     * @param {Function} callback The callback to execute after the server has responded 
     */
    function retrieveAllSessionNotes(sessionId, userId, callback) {
        $.post("http://localhost:9000/notes/getallsessionnotes", {
            sessionId: sessionId,
            userId: userId
        }).done(function(data) {
            if (data.success) {
                callback(data.result);
            } else {
                alert("An error has occured retrieving the session notes. Please try again");
                console.log(data);
            }
        });
    }

    /**
     * Given a note id, delete that note from the current session
     * The delete is being handled here instead of in the Note itself, because we also need the current session
     * 
     * @memberof Notes
     * @param {String} noteId The id of the note to delete
     * @param {Function} callback The callback to execute after the server has responded 
     */
    function deleteNote(noteId, callback) {
        for (var note in noteList) {
            if (noteList[note]._id == noteId) {
                noteList[note].deleteNote(currentUserId, function() {
                    callback();
                });
                break;
            }
        }
    }

    /**
     * Removes a note from noteList
     * 
     * @memberof Notes
     * @param {String} noteId The id of the note to remove from the list
     */
    function removeNote(noteId) {
        noteList = noteList.filter(function(value) {
            return value._id != noteId;
        });
        noteObserver.notify(noteList);
    }


    /**
     * Sets the current user id - Value may only be set once
     * 
     * @param {String} newUserId - ID to set currentUserID as
     * @memberof Books
     */
    function setCurrentUserId(newUserId) {
        if (!currentUserId) {
            currentUserId = newUserId;
        } else {
            console.error("Current User Id may only be set once");
        }
    }
    /**
     * Returns currentUserId
     * 
     * @return {String} The current User ID
     * @memberof Books
     */
    function getCurrentUserId() {
        return currentUserId;
    }

    return {
        getNoteObserver,
        addNote,
        createNewNote,
        removeAllNotes,
        getNoteList,
        setNoteList,
        getSessionNotes,
        deleteNote,
        removeNote,
        setCurrentUserId,
        getCurrentUserId
    };
})();

/**
 * Handles all of the functionality related to an individual chat message
 * @constructor
 */
function Note(noteDetails) {
    /**
     * The unique id of the note
     * @member {String}
     */
    this._id = noteDetails._id;
    /**
     * The user who sent the message
     * @member {String}
     */
    this.user = noteDetails.user;
    /**
     * The contents of the message
     * @member {String}
     */
    this.note = noteDetails.note;
    /**
     * The page number this note belongs to
     * @member {Integer}
     */
    this.pageNum = noteDetails.pageNum;
    /**
     * The page number this note belongs to
     * @member {Integer}
     */
    this.sessionId = noteDetails.sessionId;

    /**
     * Deletes the note
     * 
     * @param {Function} callback The callback to be executed when the note is deleted
     */
    this.deleteNote = function(userId, callback) {
        $.post("http://localhost:9000/notes/deletenote", {
            sessionId: this.sessionId,
            noteId: this._id,
            userId: userId
        }).done(function(data) {
            if (data.success) {
                callback();
            } else {
                alert("An error has occured deleting this note. Please try again");
                console.log(data);
            }
        });
    };
}