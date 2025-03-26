# Project

Backend system for Emergency Response Platform using Express.JS.

## Requirements

* NodeJS version v22.13.1 or higher.
* NMP version 10.9.2.
* NVM can be used for node version installation and dependencies (optional).
* Express.JS version 4.21.2.
* MySQL version 5.7.31 or higher.

## Setup Environment

The following environment variables are essential and should be set up for the solution:

* APP_NAME=***
* APP_VERSION=***
* ENV_NAME=***
* DB_HOST=***
* DB_USER=***
* DB_PASSWORD=***
* DB_NAME=***
* WEBHOOK_SECRET=***
* API_KEY=***
* PORT=***

### Migration

To create the required table(s) via the migration script, you can setup a MySQL instance and create a new database then run the following command:

`node ./migrations/emergencies.js`

## Installation

* Run `npm install` to install dependencies (required modules).

## Usage and Test

* Run `npm start` or `node server.js` to start and run the solution.
* Run `npm test` to run the unit test cases.

## Notes

* The solution has the following libraries and modules installed for usage.
    * `swagger-jsdo` and `swagger-ui-express` (for API documentation).
    * `dotenv` (for Environment variables definition).
    * `jest` and `supertest` (for unit tests).
    * `socket.io` for WebSocket server connection.
* The solution uses ES module as a type defined in the ECMAScript standard.
* To receive a new panic request from external provider, the request header must be set up using either the `x-webhook-signature` or `x-api-key` as header parameter. This is to secure and limit the external request calls to the internal system.
* To access the API documentation for the solution, navigate to the route `/api/documentation` for the swagger ui view.