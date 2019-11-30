const mongoose = require('mongoose');

const eventsRouter = require('./controllers/eventsRouter');

const { MONGODB_URI } = process.env;

const connectToDB = () => {
  mongoose
    .connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log('Successfully connected to MongoDB'))
    .catch((error) => {
      console.log(`Error connecting to database: ${error}`);
      mongoose.connection.close();
    });
};

module.exports = { connectToDB, eventsRouter };
