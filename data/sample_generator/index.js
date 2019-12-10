const axios = require('axios');
const faker = require('faker');

let event = {};

faker.locale = "de_AT"

for (let i=0; i<=50; i++ ) {
  event = {
    title: faker.company.catchPhrase(),
    description: faker.lorem.sentence(),
    date: faker.date.future().toISOString().substring(0, 10),
    time: faker.date.future().toISOString().substring(11, 16),
    place: faker.address.streetAddress(),
    contact: faker.internet.email(),
    institute: faker.company.companyName(),
    entry: faker.finance.amount() + "€",
  }

  //console.log(event);

  axios.post('https://msd3-webapp.herokuapp.com/api/events', event)
  .then(() => console.log(`Created user #${i+1}`))
  .catch(() => console.log("ERRRRRROR"));
}
