const axios = require('axios');
const faker = require('faker');

faker.locale = 'de_AT';

const sampleSize = 20;

let counter = 0;
let event = {};

const interval = setInterval(() => {
  event = {
    title: faker.company.catchPhrase(),
    description: faker.lorem.sentence(),
    date: faker.date.future().toISOString().substring(0, 10),
    time: faker.date.future().toISOString().substring(11, 16),
    place: faker.address.streetAddress(),
    contact: faker.random.boolean() ? faker.internet.email() : faker.internet.url(),
    institute: faker.company.companyName(),
    entry: faker.random.boolean() ? `${faker.finance.amount()}€` : 'Keine Anmeldung erforderlich',
  };

  // console.log(event);

  if (sampleSize > counter) {
    axios.post('https://msd3-webapp.herokuapp.com/api/events', event)
      .then(() => console.log(`${++counter}/${sampleSize} users created`))
      .catch((error) => console.log(error));
  } else {
    clearInterval(interval);
  }
}, 250);
