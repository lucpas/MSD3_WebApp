const express = require('express');
const cors = require('cors');
const { connectToMongoDB } = require('./dbConnector');

const eventsRouter = require('./controllers/eventsRouter');
const fileImportRouter = require('./controllers/fileImportRouter');
const fileExportRouter = require('./controllers/fileExportRouter');

connectToMongoDB();

const app = express();

// Apply Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/events', eventsRouter);
app.use('/api/upload', fileImportRouter);
app.use('/api/download', fileExportRouter);
app.use(express.static('frontend'));

// Listen to incoming requests
app.listen(process.env.PORT || 8080);
