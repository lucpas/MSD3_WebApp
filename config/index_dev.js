const express = require('express');

const apiRouter = require('../api/index');

const api = express();
api.use('/api', apiRouter);
api.listen(process.env.PORT || 8080);
