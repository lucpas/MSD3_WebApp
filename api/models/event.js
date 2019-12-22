const mongoose = require('mongoose');

const eventSchema = mongoose.Schema({
  title: {
    type: String,
    maxlength: [30, 'Titel darf nicht länger als 30 Zeichen sein']
  },
  description: String,
  date: String,
  time: String,
  place: String,
  contact: String,
  institute: String,
  entry: String,
});

eventSchema.set('toJSON', {
  transform: (doc, ret) => {
    /* eslint-disable */
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    /* eslint-enable */
  },
});

module.exports = mongoose.model('Event', eventSchema);
