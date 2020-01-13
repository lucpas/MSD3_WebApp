const fileImportRouter = require('express').Router();

const Event = require('../models/event');

const convertCSVToEventsArray = require('../filehandlers/eventsToCSV');
const { reformatValidationErrors } = require('../utils');

fileImportRouter.post('/csv', (req, res) => {
  console.log('Success upload');
  res.send('GREAT SUCCESS');
});

module.exports = fileImportRouter;
