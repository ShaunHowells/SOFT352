--- Repository for SOFT352 coursework --- 

IMPORTANT - This project requires Node and Mongo to be installed (for the Server and the database respectively).
Headless Chrome/Puppeteer is used to run the QUnit tests via the npm script (as well as on the Jenkins server used during development)
so Chrome will also need to be installed to run these test scripts.

INSTALLATION GUIDE:
1). Open a commandline in the root of the project (where this README.txt lives)
2). Ensure the server is not currently running
3). Run the "npm run init-application" script to install the required npm libraries and add some sample books to MongoDB.
4). (Optional) Run the "npm run complete-test" script to run the QUnit and Cucumber/Gherkin tests.
5). To start the server run the "npm run start-server" command.
6). Open the Website/src/html/home.html page to use the application.

USEFUL SCRIPTS (to be run in the project root)
npm run init-application -          Runs both npm run complete-install and npm run populate-databases. This installs all of the neccessary npm modules, the populates the normal and test databases with books to be used.
npm run complete-install -          Installs all of the packages required for this application.
npm run populate-databases -        Adds 3 samples books to both the normal and test database. NOTE: This should only be run once as you will have multiple copies of the same books otherwise.
npm run complete-test -             Runs both the Website and Server tests against the test database. Displays test results in the console.
npm run complete-test-reports       Runs both the Website and Server tests against the test database. Does not display all test results in the console, but does produces test reports. Test result are stored in Website/test/QUnit/report and Server/test/Cucumber/report.
npm run generate-documentation -    Generates JSDoc documentation for both the Server and Website. The generated documentation will be stored in Server/Documentation/JSDoc and Website/Documentation/JSDoc.
npm run eslint -                    Runs eslint on the Server and Website files using my configuration and .ignore files.
npm run start-server -              Starts the server.

--BASIC INFO--
This Repository contains the files for the Collaborative Book Reader.

This is split into two main Areas, Server and Website:
Server contains all of the files required for the NodeJS server.
Website contains all of the files required for the Website.

The Server can be run in either normal or test mode. The Website should be used with the normal database (run via the npm run start-server script).
They are functionally the same, but test mode points at the test database used for running tests against as to not ruin the data in the main database. 
The test database should never need to be manually run as it is handled via the npm scripts above.