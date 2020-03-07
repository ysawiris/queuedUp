# QueuedUp API

This API will allow you to add song to your friends Spotify queue!

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

```
$ node.js
```
Don't forget to install the necessesry modules which include: express, handlebars, etc.

### Installing

For example to install express type the command


```
$ npm install express --save
```

If express handlebars are not rendering then try

```
$ npm i -D handlebars@4.5.0
```

Create config folder

```
$ touch key.js
```

Add secret keys to key.js

(DONT forget to add it to your .env)

clientID: '?????????????????????????'

clientSecret: '???????????????????????'


Once loaded, start the server!

```
$ nodemon
```

## Deployment


http://queuedup-v1.herokuapp.com/


## Authors

Youssef Sawiris github@ysawiris