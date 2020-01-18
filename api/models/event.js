const mongoose = require('mongoose');

// All Validators

var parseForSemicolon = function(inpField) {
  const currInpField = inpField;
  if (currInpField.indexOf(';') === -1) {
    return true;
  } else {
    console.log("Semicolons [;] not allowed");
    return false;
  }
};

var parseTitle = function(inp) {
  if (inp.length === 0 || inp.length > 30) {
    return false;
  } else {
    return true;
  };
};

var parseDesc = function(inp) {
  if (inp.length === 0 || inp.length > 200) {
    return false;
  } else {
    return true;
  };
};

var parseDate = function(inp) {
  if (/([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/.test(inp)) {
    return true;
  } else {
    return false;
  };
};

var parseTime = function(inp) {
  if (/^(0[0-9]|1[0-9]|2[0-3]|[0-9]):[0-5][0-9]$/.test(inp)) {
    return true;
  } else {
    return false;
  };
};

var parsePlace = function(inp) {
  if (inp.length === 0 || inp.length > 30) {
    return false;
  } else {
    return true;
  };
};

var parseContact = function(inp) {
  if (/^[a-zA-Z0-9.!#$%&'*+=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$|^(https:|http:|www\.)\S*/.test(inp)) {
    return true;
  } else {
    return false;
  };
};

// List of institutes of FH Joanneum
var institutes = [
  "International Management",
  "Industriewirtschaft",
  "Gesundheits- und Tourismusmanagement",
  "Bank- und Versicherungswirtschaft",
  "Biomedizinische Analytik",
  "Logopaedie",
  "Radiologietechnologie",
  "Physiotherapie",
  "Diaetologie",
  "Ergotherapie",
  "Hebammenwesen",
  "Gesundheits- und Krankenpflege",
  "Internet-Technologien & -Anwendungen",
  "Informationsmanagement",
  "eHealth",
  "Journalismus und Public Relations",
  "Design & Kommunikation",
  "Product & Transportation Design",
  "Fahrzeugtechnik / Automotive Engineering",
  "Luftfahrt / Aviation",
  "Electronic Engineering",
  "Angewandte Produktionswissenschaften",
  "Architektur & Management",
  "Bauplanung und Bauwirtschaft",
  "Energie-, Verkehrs- und Umweltmanagement",
  "Soziale Arbeit",
];


var parseInst = function(inp) {
  if (institutes.includes(inp)) {
    return true;
  } else {
    return false;
  };
};



// Combined Validators.

var validateTitle = [{
    validator: parseForSemicolon,
    msg: 'Kein Semikolons [;] erlaubt'
  },
  {
    validator: parseTitle,
    msg: 'Titel darf nicht leer sein/maximal 30 Zeichen erlaubt'
  }
];

var validateDesc = [{
    validator: parseForSemicolon,
    msg: 'Kein Semikolons [;] erlaubt'
  },
  {
    validator: parseDesc,
    msg: 'Beschreibung darf nicht leer sein/maximal 200 Zeichen erlaubt'
  }
];

var validateDate = [{
    validator: parseForSemicolon,
    msg: 'Kein Semikolons [;] erlaubt'
  },
  {
    validator: parseDate,
    msg: 'Kein passendes Datum-Format (yyyy.mm.dd)'
  }
];

var validateTime = [{
    validator: parseForSemicolon,
    msg: 'Kein Semikolons [;] erlaubt'
  },
  {
    validator: parseTime,
    msg: 'Kein passendes Zeit-Format (24h, HH:MM)'
  }
];

var validatePlace = [{
    validator: parseForSemicolon,
    msg: 'Kein Semikolons [;] erlaubt'
  },
  {
    validator: parsePlace,
    msg: 'Ort darf nicht leer sein/maximal 30 Zeichen erlaubt'
  }
];

var validateContact = [{
    validator: parseForSemicolon,
    msg: 'Kein Semikolons [;] erlaubt'
  },
  {
    validator: parseContact,
    msg: 'Kein passendes Kontakt-Format (Email oder URL)'
  }
];

var validateInst = [{
    validator: parseForSemicolon,
    msg: 'Kein Semikolons [;] erlaubt'
  },
  {
    validator: parseInst,
    msg: 'Institut nicht gefunden'
  }
];

var validateEntry = [{
    validator: parseForSemicolon,
    msg: 'Kein Semikolons [;] erlaubt'
  }
];


// Validation schema
const eventSchema = mongoose.Schema({
  title: {
    type: String,
    validate: validateTitle
  },
  description: {
    type: String,
    validate: validateDesc
  },
  date: {
    type: String,
    validate: validateDate
  },
  time: {
    type: String,
    validate: validateTime
  },
  place: {
    type: String,
    validate: validatePlace
  },
  contact: {
    type: String,
    validate: validateContact
  },
  institute: {
    type: String,
    validate: validateInst
  },
  entry: {
    type: String,
    validate: validateEntry
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
