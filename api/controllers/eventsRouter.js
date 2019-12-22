const eventsRouter = require('express').Router();

const Event = require('../models/event');

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

  event
    .save()
    .then((result) => {
      res.status(201).json(result);
    })
    .catch((error) => {
      console.log(`Failed at POST: ${error}`);
      res.status(500).send();
    });
});

eventsRouter.put('/:id', (req, res) => {
  Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    useFindAndModify: false,
  })
    .then((result) => res.status(200).json(result))
    .catch((error) => {
      console.log(`Failed at PUT: ${error}`);
      res.status(500).send();
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
