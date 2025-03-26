# Project

Frontend dashboard for Emergency Response Platform using Angular.

## Requirements

* NodeJS version v22.13.1 or higher.
* NMP version 10.9.2.
* NVM can be used for node version installation and dependencies (optional).

## Setup Environment

The following environment variables are essential and should be set up for the solution:

* production=***
* apiBaseUrl=***
* socketBaseUrl=***

## Installation

* Run `npm install` to install dependencies (required modules).

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Notes and Additional Resources

* This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.3. 
* `ng` cli must be installed globally on the system for angular commands interaction.
* Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.
* Angular CLI includes powerful code scaffolding tools. To generate a new component, run: 
    ```bash
    ng generate component component-name
    ```
* For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:
    ```bash
    ng generate --help
    ```
* For end-to-end (e2e) testing, run:
    ```bash
    ng e2e
    ```
* `socket.io-client` module is used for WebSocket client interaction.
* For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
