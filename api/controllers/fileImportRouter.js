const fileImportRouter = require('express').Router();
const multer = require('multer');

const upload = multer();

// const upload = require('express-fileupload')

const Event = require('../models/event');

const convertCSVToEventsArray = require('../filehandlers/csvToEvents');

fileImportRouter.post('/csv', upload.single('file'), (req, res) => {
  const events = convertCSVToEventsArray(req.file.buffer).map(
    (event) => new Event(event),
  );

  Event.insertMany(events, { ordered: false })
    .then((result) => {
      res.status(200).send(`${result.length}`);
    })
    .catch((error) => res.status(500).send());
});

module.exports = fileImportRouter;
