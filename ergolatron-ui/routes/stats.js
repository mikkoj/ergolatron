var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  res.render('stats', { title: 'Stats' });
});

module.exports = router;
