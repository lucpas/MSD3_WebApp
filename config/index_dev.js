const express = require('express');
// const jsonServer = require('json-server');
const cors = require('cors');
const { connectToDB, eventsRouter } = require('../api/index');

connectToDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
// app.use('/api', jsonServer.router('./data/eventData.json'));
app.use('/api', eventsRouter);

app.listen(process.env.PORT || 8080);
