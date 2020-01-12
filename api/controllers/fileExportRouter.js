const fileExportRouter = require('express').Router();

const Event = require('../models/event');

const convertEventsArrayToCSV = require('../filehandlers/eventsToCSV');
const convertEventsArrayToPDF = require('../filehandlers/eventsToPDF');

fileExportRouter.get('/pdf', (req, res) => {
  Event.find({})
    .then((events) => {
      pdfData = convertEventsArrayToPDF(events);
      res.contentType('application/pdf');
      res.status(200).send(pdfData);
    })
    .catch((error) => {
      console.log(`Failed at GET:/pdf -  ${error}`);
      res.status(500).send();
    });
});

fileExportRouter.get('/csv', (req, res) => {
  Event.find({})
    .then((events) => {
      pdfData = convertEventsArrayToCSV(events);
      res.contentType('text/csv');
      res.status(200).send(pdfData);
    })
    .catch((error) => {
      console.log(`Failed at GET:/csv -  ${error}`);
      res.status(500).send();
    });
});

module.exports = fileExportRouter;
