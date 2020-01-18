const fileImportRouter = require('express').Router();
const multer = require('multer');

const upload = multer();

const Event = require('../models/event');

const convertCSVToEventsArray = require('../filehandlers/eventsToCSV');
const { reformatValidationErrors } = require('../utils');

fileImportRouter.post('/csv', upload.single(''), (req, res) => {
  console.log('Success upload');

  const csv = req.file.buffer.toString('utf8');
  console.log('FILE:', csv);
  
  res.send('GREAT SUCCESS');
});

module.exports = fileImportRouter;
