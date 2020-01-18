const mongoose = require('mongoose');

// All Validators

const semicolonValidator = {
  validator(inpField) {
    const currInpField = inpField;
    if (currInpField.indexOf(';') === -1) {
      return true;
    }
    return false;
  },
  msg: 'Eingabe darf keine Semikolons [;] enthalten',
};

const parseTitle = function (inp) {
  if (inp.length === 0 || inp.length > 50) {
    return false;
  }
  return true;
};

const parseDesc = function (inp) {
  if (inp.length === 0 || inp.length > 200) {
    return false;
  }
  return true;
};

const parseDate = function (inp) {
  if (/([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/.test(inp)) {
    return true;
  }
  return false;
};

const parseTime = function (inp) {
  if (/^(0[0-9]|1[0-9]|2[0-3]|[0-9]):[0-5][0-9]$/.test(inp)) {
    return true;
  }
  return false;
};

const parsePlace = function (inp) {
  if (inp.length === 0 || inp.length > 100) {
    return false;
  }
  return true;
};

const parseContact = function (inp) {
  if (
    /^[a-zA-Z0-9.!#$%&'*+=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$|^(https:|http:|www\.)\S*/.test(
      inp,
    )
  ) {
    return true;
  }
  return false;
};

const parseInst = function (inp) {
  if (inp.length === 0 || inp.length > 100) {
    return false;
  }
  return true;
};

const parseEntry = function (inp) {
  if (inp.length === 0 || inp.length > 100) {
    return false;
  }
  return true;
};

const checkIfFieldEmpty = function (inp) {
  return inp.length > 0;
};

// Combined Validators.

const validateTitle = [
  semicolonValidator,
  {
    validator: checkIfFieldEmpty,
    msg: 'Titel darf nicht leer sein',
  },
  {
    validator: parseTitle,
    msg: 'Titel darf maximal 50 Zeichen enthalten',
  },
];

const validateDesc = [
  semicolonValidator,
  {
    validator: checkIfFieldEmpty,
    msg: 'Beschreibung darf nicht leer sein',
  },
  {
    validator: parseDesc,
    msg: 'Beschreibung darf maximal 200 Zeichen enthalten',
  },
];

const validateDate = [
  semicolonValidator,
  {
    validator: checkIfFieldEmpty,
    msg: 'Datum darf nicht leer sein',
  },
  {
    validator: parseDate,
    msg: 'Kein unterstütztes Datum-Format (yyyy-mm-dd)',
  },
];

const validateTime = [
  semicolonValidator,
  {
    validator: checkIfFieldEmpty,
    msg: 'Uhrzeit darf nicht leer sein',
  },
  {
    validator: parseTime,
    msg: 'Kein unterstütztes Zeit-Format (24h, HH:MM)',
  },
];

const validatePlace = [
  semicolonValidator,
  {
    validator: checkIfFieldEmpty,
    msg: 'Ort darf nicht leer sein',
  },
  {
    validator: parsePlace,
    msg: 'Ort darf maximal 100 Zeichen enhalten',
  },
];

const validateContact = [
  semicolonValidator,
  {
    validator: checkIfFieldEmpty,
    msg: 'Kontakt darf nicht leer sein',
  },
  {
    validator: parseContact,
    msg: 'Kontakt muss eine Email-Adresse oder URL sein',
  },
];

const validateInst = [
  semicolonValidator,
  {
    validator: checkIfFieldEmpty,
    msg: 'Institut darf nicht leer sein',
  },
  {
    validator: parseInst,
    msg: 'Institut darf maximal 100 Zeichen enthalten',
  },
];

const validateEntry = [
  semicolonValidator,
  {
    validator: checkIfFieldEmpty,
    msg: 'Eintritt darf nicht leer sein',
  },
  {
    validator: parseEntry,
    msg: 'Eintritt darf maximal 100 Zeichen enthalten',
  },
];

// Validation schema
const eventSchema = mongoose.Schema({
  title: {
    type: String,
    validate: validateTitle,
  },
  description: {
    type: String,
    validate: validateDesc,
  },
  date: {
    type: String,
    validate: validateDate,
  },
  time: {
    type: String,
    validate: validateTime,
  },
  place: {
    type: String,
    validate: validatePlace,
  },
  contact: {
    type: String,
    validate: validateContact,
  },
  institute: {
    type: String,
    validate: validateInst,
  },
  entry: {
    type: String,
    validate: validateEntry,
  },
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
