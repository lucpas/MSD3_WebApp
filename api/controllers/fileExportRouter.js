const fileExportRouter = require('express').Router();

const Event = require('../models/event');

const convertEventsArrayToCSV = require('../filehandlers/eventsToCSV');
const convertEventsArrayToPDF = require('../filehandlers/eventsToPDF');

fileExportRouter.post('/pdf', (req, res) => {
  let queryPromise;
  if (req.body === {}) {
    queryPromise = Event.find({});
  } else {
    queryPromise = Event.find()
      .where('_id')
      .in(req.body)
      .exec();
  }

  queryPromise
    .then((events) => {
      const pdfData = convertEventsArrayToPDF(events);
      res.contentType('application/pdf');
      // res.status(200).send(pdfData);
      pdfData.pipe(res);
      pdfData.end();
    })
    .catch((error) => {
      console.log(`Failed at GET:/pdf -  ${error}`);
      res.status(500).send();
    });
});

fileExportRouter.post('/csv', (req, res) => {
  let queryPromise;
  if (req.body === {}) {
    queryPromise = Event.find({});
  } else {
    queryPromise = Event.find()
      .where('_id')
      .in(req.body)
      .exec();
  }

  queryPromise
    .then((events) => {
      const csvData = convertEventsArrayToCSV(events);
      res.contentType('text/csv');
      res.status(200).send(csvData);
    })
    .catch((error) => {
      console.log(`Failed at GET:/csv -  ${error}`);
      res.status(500).send();
    });
});

module.exports = fileExportRouter;
