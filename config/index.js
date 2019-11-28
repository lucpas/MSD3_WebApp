const express = require('express');
const jsonServer = require('json-server');
const cors = require('cors');

const app = express();

app.use(cors());
app.use('/api', jsonServer.router('./data/eventData.json'));
app.use(express.static('frontend'));

app.listen(process.env.PORT || 8080);
