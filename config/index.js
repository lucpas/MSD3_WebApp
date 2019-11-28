const express = require('express');
const jsonServer = require('json-server');

const app = express();
app.use('/api', jsonServer.router('./data/eventData.json'));
app.use(express.static('frontend'));

app.listen(process.env.PORT || 8080);
