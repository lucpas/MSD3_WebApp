const fileImportRouter = require('express').Router();

const Event = require('../models/event');

const convertCSVToEventsArray = require('../filehandlers/eventsToCSV');

fileImportRouter.post('/csv', (req, res) => {

});

module.exports = fileImportRouter;
