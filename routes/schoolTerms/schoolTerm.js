var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('schoolTerms/schoolTerm', { title: 'ABET Assessment' });
});

module.exports = router;