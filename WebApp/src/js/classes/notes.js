/**
 * @classdesc Handles all of the functionality relating to the handling of multiple 'Notes'.
 * 
 * @class
 * @hideconstructor
 */
var Notes = (function() { // eslint-disable-line no-unused-vars
    var noteList = [];

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
    function createNewNote(pageNum, note, callback) {
        $.post("http://localhost:9000/notes/addnewnote", {
            sessionId: CollabBookReader.getSessions().getCurrentUserSession()._id,
            userId: CollabBookReader.getSessions().getCurrentUserId(),
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

    function getSessionNotes(session) {
        if (session && !session.test) {
            retrieveAllSessionNotes(session._id, function(data) {
                setNoteList(data.notes);
            });
        } else {
            removeAllNotes();
        }
    }

    function retrieveAllSessionNotes(sessionId, callback) {
        $.post("http://localhost:9000/notes/getallsessionnotes", {
            sessionId: sessionId,
            userId: CollabBookReader.getSessions().getCurrentUserId()
        }).done(function(data) {
            if (data.success) {
                callback(data.result);
            } else {
                alert("An error has occured retrieving the session notes. Please try again");
                console.log(data);
            }
        });
    }

    return {
        getNoteObserver,
        addNote,
        createNewNote,
        removeAllNotes,
        getNoteList,
        setNoteList,
        getSessionNotes
    };
})();

/**
 * Handles all of the functionality related to an individual chat message
 * @constructor
 */
function Note(noteDetails) {
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
}