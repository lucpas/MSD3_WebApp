const express = require('express');

const apiRouter = require('../api/index');

// const api = express();
// api.use(apiRouter);
// api.listen(process.env.PORT_API || 3000);

// const frontend = express();
// frontend.use(express.static('frontend'));
// frontend.listen(process.env.PORT_FE || 8080);

const app = express();

app.use('/api', apiRouter);
app.use(express.static('frontend'));

app.listen(process.env.PORT || 8080);
