CollabBookReader.getSessions().getCurrentUserSessionObserver().subscribe(CollabBookReader.getBooks().getSessionBookPage);
CollabBookReader.getSessions().getCurrentUserSessionObserver().subscribe(CollabBookReader.getNotes().getSessionNotes);
CollabBookReader.getSessions().getCurrentUserSessionObserver().subscribe(CollabBookReader.getUsers().removeAllUsers);
CollabBookReader.getSessions().getCurrentUserSessionObserver().subscribe(CollabBookReader.getChat().removeAllChatMessages);