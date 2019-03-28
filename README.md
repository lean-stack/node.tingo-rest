# Tingo Rest

> Minimal [Express](https://expressjs.com) Middleware exposing a JSON API

## Usage:

    npm install tingo-rest

And create a ```index.js```

    const app = require('express')();
    const restAPI = require('tingo-rest');

    app.use('/api',restAPI('data'));

    const server = app.listen(3000, function () {

      const host = server.address().address;
      const port = server.address().port;

      console.log(`API Server listening at http://${host}:${port}`);

    });
