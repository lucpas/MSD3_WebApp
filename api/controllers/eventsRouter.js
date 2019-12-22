const eventsRouter = require('express').Router();

const Event = require('../models/event');

const { reformatValidationErrors } = require('../utils');

eventsRouter.get('/', (req, res) => {
  Event.find({})
    .then((events) => {
      res.status(200).json(events);
    })
    .catch((error) => {
      console.log(`Failed at GET: ${error}`);
      res.status(500).send();
    });
});

eventsRouter.post('/', (req, res) => {
  const event = new Event(req.body);

  const validateOnly = req.query.validate === 'true';
  if (validateOnly) {
    const errors = event.validateSync().errors;

    if (errors) {
      res.status(400).json(reformatValidationErrors(errors)).send();
    } else {
      res.status(200).send();
    }
    
    return;
  }

  event
    .save()
    .then((result) => {
      res.status(201).json(result);
    })
    .catch((error) => {
      console.log(`Failed at POST: ${error}`);

      if (error.name === 'ValidationError') {
        res.status(400).json(reformatValidationErrors(error.errors)).send();
      } else {
        res.status(500).send();
      }
    });
});

eventsRouter.put('/:id', (req, res) => {
  Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    useFindAndModify: false,
    runValidators: true,
    context: 'query',
  })
    .then((result) => res.status(200).json(result))
    .catch((error) => {
      console.log(`Failed at PUT: ${error}`);

      if (error.name === 'ValidationError') {
        res.status(400).json(reformatValidationErrors(error.errors)).send();
      } else {
        res.status(500).send();
      }
    });
});

eventsRouter.delete('/:id', (req, res) => {
  Event.findByIdAndDelete(req.params.id)
    .then(() => res.status(204).send())
    .catch((error) => {
      console.log(`Failed at DELETE: ${error}`);
      res.status(500).send();
    });
});

module.exports = eventsRouter;
