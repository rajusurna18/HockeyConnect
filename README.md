HockeyConnect 🏑
HockeyConnect is a student web application project for managing hockey
player information and participation records.
Features
- Manage player records.
- Import player information from CSV files.
- Export player records to CSV files.
- Store player information in the backend database.
- Authentication-related functionality and demo roles.
- Backend health-check endpoint.
- Separate frontend and backend applications.
Available features depend on the current code and configuration in your
local checkout.
Technology Stack
Backend - Java 21 - Spring Boot 3.3.5 - Maven - REST API - H2
database for the configured local development setup

Frontend - JavaScript-based frontend - Node.js and npm
Project Structure
HockeyConnect/
├── backend/
│   ├── pom.xml
│   └── src/
└── frontend/
    └── package.json
The exact structure may change as development continues.
Requirements
Install JDK 21, Apache Maven, Node.js, and npm.
java -version
mvn -version
node -v
npm -v
Run the Backend
Open a terminal in the project folder:
cd backend
mvn spring-boot:run
The backend is expected to run at http://localhost:8080.
Check Backend Health
In another terminal:
curl http://localhost:8080/api/health
If the endpoint returns a healthy status, the backend is running. You do
not need to start it again while the current process is still running.
Run the Frontend
Open a separate terminal:
cd frontend
npm install
npm run dev
Open the local URL printed in the terminal. Keep both frontend and
backend terminals running while using the app.
CSV Import and Export
1. Check the CSV headers expected by the current implementation.
2. Keep the file format and column names consistent.
3. Test with a small sample CSV first.
4. Confirm imported records in the app or database.
5. Export a sample and verify the output.
Use test or non-sensitive player data during development.
API Notes
- Local backend URL: http://localhost:8080
- Health endpoint: GET /api/health
- Other endpoints may require authentication. Check the current
  controller and security configuration for exact routes and access
  rules.
Troubleshooting
mvn is not recognized
Ensure Maven's bin folder is included in your Windows PATH. Reopen
the terminal and run mvn -version.
Port 8080 is already in use
Stop the process using port 8080 or change the configured server port.
package.json cannot be found
Run npm commands from the frontend directory.
API returns 401 Unauthorized or 403 Forbidden
The endpoint may require a valid login/token or may be restricted by
security rules. Check the authentication flow, security configuration,
and backend logs. Do not disable authentication globally just to hide
the error.
Imported CSV data does not appear
Check the CSV headers, API response, backend logs, database
configuration, and whether the import request completed successfully.
Development and Security Notes
- Do not commit passwords, API keys, private keys, or service-account
  files.
- Keep secrets in environment variables or a local configuration file
  excluded from Git.
- Test authentication and CSV import/export after backend changes.
- The local H2 database may be temporary, depending on the active
  profile and configuration.
Possible Future Improvements
- Player and team dashboards
- Match schedules and score management
- Participation analytics
- Improved validation and error messages
- Production database and deployment configuration
These are potential improvements, not claims that they are already
implemented.
Author
Developed as a student project.
License
No license has been specified. Add a license before redistributing the
project publicly.
