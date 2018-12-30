Sessions.getCurrentUserSessionObserver().subscribe(Books.getSessionBookPage);
Sessions.getCurrentUserSessionObserver().subscribe(Notes.getSessionNotes);
Sessions.getCurrentUserSessionObserver().subscribe(Users.removeAllUsers);
Sessions.getCurrentUserSessionObserver().subscribe(CollabBookReader.getChat().removeAllChatMessages);