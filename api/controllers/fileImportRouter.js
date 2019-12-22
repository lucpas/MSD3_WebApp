const fileImportRouter = require('express').Router();

const convertCSVToEventsArray = require('../filehandlers/eventsToCSV');

fileImportRouter.post('/csv', (req, res) => {

});

module.exports = fileImportRouter;
