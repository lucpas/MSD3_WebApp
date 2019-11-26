const express = require('express');

const router = express.Router();

router.get('/test', (req, res) => {
  console.log('API TEST');
  res.send('hier könnte ihre API stehen');
});

module.exports = router;
