const express = require('express');
const jsonServer = require('json-server');
const cors = require('cors');

const api = express();

api.use(cors());
api.use('/api', jsonServer.router('./data/eventData.json'));

api.listen(process.env.PORT || 8080);
