const fileExportRouter = require('express').Router();

const convertEventsArrayToCSV = require('../filehandlers/eventsToCSV');
const convertEventsArrayToPDF = require('../filehandlers/eventsToPDF');

fileExportRouter.get('/pdf', (req, res) => {


});

fileExportRouter.get('/csv', (req, res) => {


});

module.exports = fileExportRouter;
