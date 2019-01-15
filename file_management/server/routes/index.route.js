var express = require('express');
const userRoutes = require('./users.route');
const objectRoutes = require('./objects.route');

var router = express.Router();


/* GET home page. */
router.get('/health-check', (req, res) =>
  res.send('OK')
);

router.use('/objects', objectRoutes);
router.use('/users', userRoutes);

module.exports = router;