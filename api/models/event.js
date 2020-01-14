const mongoose = require('mongoose');

const eventSchema = mongoose.Schema({
  title: {
    type: String,
    maxlength: [30, 'Titel darf nicht länger als 30 Zeichen sein'],
    required: [true, 'Titel darf nicht leer sein']
  },
  description: {
    type: String,
    maxlength: [200, 'Beschreibung darf nicht länger als 200 Zeichen sein'],
    required: [true, 'Beschreibung darf nicht leer sein'],
  },
  date: {
    type: String,
    validate: {
      validator: function(date){
        return /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/.test(date)
      },
      message: props => `${props.value} ist kein passendes Datumformat (dd.mm.yyyy)`
    },
    required: [true, 'Datum darf nicht leer sein'],
  },
  time: {
    type: String,
    validate: {
      validator: function(time){
        return /^(0[0-9]|1[0-9]|2[0-3]|[0-9]):[0-5][0-9]$/.test(time)
      },
      message: props => `${props.value} ist kein passendes Zeitformat (24h, HH:MM)`
    },
    required: [true, 'Zeit darf nicht leer sein'],
  },
  place: {
    type: String,
    maxlength: [30, 'Ort darf nicht länger als 30 Zeichen sein'],
    required: [true, 'Ort darf nicht leer sein']
  },
  contact: {
    type: String,
    validate: {
      validator: function(contact){
        return /^[a-zA-Z0-9.!#$%&'*+=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$|^(https:|http:|www\.)\S*/.test(contact)
      },
      message: props => `${props.value} ist kein passendes Kontaktformat (Email/URL)`
    },
    required: [true, 'Kontakt darf nicht leer sein'],
  },
  institute: {
    type: String,
    //enum: ["Institut1", "Institut2", "Institut3"], --> Liste hard coded
    required: [true, 'Institut darf nicht leer sein'],
  },
  entry: {
    type: String,
    required: false,
  }
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
