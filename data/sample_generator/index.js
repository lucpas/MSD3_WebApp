const axios = require('axios');
const faker = require('faker');

faker.locale = 'de_AT';

// const url = 'https://msd3-webapp.herokuapp.com/api/events';
const url = 'http://localhost:8080/api/events';

// List of all FH Joanneum Institutes
const institutes = [
  'Angewandte Produktionswissenschaften',
  'Architektur & Management',
  'Bank- und Versicherungswirtschaft',
  'Bauplanung und Bauwirtschaft',
  'Biomedizinische Analytik',
  'Design & Kommunikation',
  'Diaetologie',
  'eHealth',
  'Electronic Engineering',
  'Energie-, Verkehrs- und Umweltmanagement',
  'Ergotherapie',
  'FH Allgemein',
  'Fahrzeugtechnik / Automotive Engineering',
  'Gesundheits- und Krankenpflege',
  'Gesundheits- und Tourismusmanagement',
  'Hebammenwesen',
  'Industriewirtschaft',
  'Informationsmanagement',
  'International Management',
  'Internet-Technologien & -Anwendungen',
  'Journalismus und Public Relations',
  'Logopaedie',
  'Luftfahrt / Aviation',
  'Physiotherapie',
  'Product & Transportation Design',
  'Radiologietechnologie',
  'Soziale Arbeit',
];

const sampleSize = 20;

let counter = 0;
let event = {};

const interval = setInterval(() => {
  event = {
    title: faker.company.catchPhrase().substring(0, 30),
    description: faker.lorem.sentence().substring(0, 200),
    date: faker.date.future().toISOString().substring(0, 10),
    time: faker.date.future().toISOString().substring(11, 16),
    place: faker.address.streetAddress(),
    contact: faker.random.boolean() ? faker.internet.email() : faker.internet.url(),
    institute: faker.random.boolean() ? faker.random.arrayElement(institutes) : faker.company.companyName(),
    entry: faker.random.boolean() ? `${faker.finance.amount()}€` : 'Keine Anmeldung erforderlich',
  };

  // console.log(event);

  if (sampleSize > counter) {
    axios.post(url, event)
      .then(() => console.log(`${++counter}/${sampleSize} events pushed`))
      .catch((error) => console.log(error));
  } else {
    clearInterval(interval);
  }
}, 250);
