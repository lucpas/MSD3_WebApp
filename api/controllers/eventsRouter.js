const eventsRouter = require('express').Router();
const Event = require('../models/event');

eventsRouter.get('/events/', (req, res) => {
  Event.find({})
    .then((events) => {
      res.json(events);
    })
    .catch((error) => {
      console.log(`Failed at GET: ${error}`);
    });
});

eventsRouter.put('/events/:id', (req, res) => {
  Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    useFindAndModify: false,
  })
    .then((result) => res.json(result))
    .catch((error) => {
      console.log(`Failed at PUT: ${error}`);
    });
});

eventsRouter.post('/events/', (req, res) => {
  const event = new Event(req.body);

  event
    .save()
    .then((result) => {
      res.status(201).json(result);
    })
    .catch((error) => {
      console.log(`Failed at POST: ${error}`);
    });
});

module.exports = eventsRouter;
