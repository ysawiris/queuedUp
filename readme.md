QueuedUp API

This API will allow you to add song to your friends Spotify queue

Getting Started

Prerequisites

node.js

Installing

Don't forget to install the necessesry modules which include: express, handlebars, etc.

For example to install express type the command

npm install express --save

If express handlebars are not rendering then try

npm i -D handlebars@4.5.0

Create config folder

touch key.js

Add secret keys to key.js


(DONT forget to add it to your .env)

clientID: '?????????????????????????'

clientSecret: '???????????????????????'

Deployment

http://queuedup-v1.herokuapp.com/

Running the tests

To run test make sure you install chai

$ npm install mocha chai chai-http --save-dev

QueuedUp test

These file test to make sure the application works correctly!

npm run test

Built With

Node & Express - The web framework used

Handlebars - Builds and compiles templates

MongoDB & Mongoose - Document database

Passport.js - Used for authorization

Ajax - Used to make calls to Spotify API on the front end 


Authors

Youssef Sawiris  - Github