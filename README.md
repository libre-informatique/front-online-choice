# Front Online Choice

WORK IN PROGRESS

This project has been the starting point of [LiftJS](https://github.com/libre-informatique/LiftJS/) library.

At this time (01/06/2017), the LiftJS project is now decoupled form this project. The LiftJS documentation would differ from this « snapshot » of the project.

## Install DEV env

-   cp data/parameters.json.dist data/parameters.json
-   edit data/parameters.json with your environments configuration
-   npm install
-   gulp
-   open localhost:8000
-   The window will refresh automatically and sass will be compiled every time you save a file in the project

## Install PROD env

-   cp data/parameters.json.dist data/parameters.json
-   edit data/parameters.json with your environments configuration

## Parameters example

```json
{
    "debug": true,
    "applicationName": "Meta Event Name",
    "user": "API-USER",
    "secret": "apisecret",
    "appHostname": "http://front-online-choice.local",
    "appUriPrefix": "",
    "webservice": {
        "hostname": "api.somewhere.net",
        "protocol": "https",
        "apiBaseUri": "/api"
    },
    "clientSessionName": "FrontOnlineChoiceSession",
    "metaEventId": 1,
    "lang": "fr",
    "maximumEventsSelectedPerTimeslots": 3
}
```
* **debug**: true, should be false for prod / demo env
* **appUriPrefix**: sets the URI prefix for history component
* **clientSessionName**: sets the key that will be used in sessionStorage and/or localStorage for the session management
* **metaEventId**: used to filter manifestation listing
* **lang**: must match event language
* **maximumEventsSelectedPerTimeslots**: default -1 : there is no active limitation of maximum selected events per timeslot

## For developpers

Please refer to [LiftJS documentation](https://github.com/libre-informatique/LiftJS/blob/master/README.md)
