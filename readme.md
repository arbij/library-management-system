Library management system with auth for users and admin

Tech stack: Sqlite db with Prisma ORM, node.js with socket-io backend, vanilla javascript frontend

To install dependencies and set up prod and test databases (needed only once), open `set up.bat`.

To run the prod server (port 5000, connects with prod db), open `server/run.bat`. For the test server (port 5001, connects with test db), open `server/run test.bat`.

To run the prod client (connects with prod server), open `client/run.bat`. For the test client (connects with test server), open `client/run test.bat`. The respective server must be running for the client to be served.

Admin password is located in .env (only for ease of set up, secrets do not get committed in real projects)