"mode strict";
var express = require('express'),
  router = express.Router();

router.get('/', function (req, res) {
  var html=
    '<h1>FreeCodeCamp API Basejump: Request Header Parser Microservice</h1>'+
    '<p>User stories:'+
    '<ol>'+
    '<li>I can get the IP address, language and operating system for my browser.</li>'+
    '</ol>'+
    '<hr>'+

    '<p>Example usage:</p>'+
    '<a href="fcc02/api/whoami">https://ikarus512-fcc.herokuapp.com/fcc02/api/whoami</a><br>'+

    '<p>Example output:</p>'+
    '<pre>{"ipaddress":"xx.xx.xx.xx","language":"en-US","software":"Linux xx"}</pre>';

  res.send(html);
});

router.get('/api/whoami', function (req, res) {

  var ipaddress, language, software;

  try {
    ipaddress = req.ip.split(':')[0];
    language = req.headers['accept-language'].split(',')[0];
    software = req.headers['user-agent']
      .replace(/^[^\()]*\(/,'')
      .split(')')[0];

  } catch(err) {
    console.log(err.message);
    ipaddress = null;
    language = null;
    software = null;
  }

  res.json({ipaddress: ipaddress, language: language, software: software});
});

// *
router.all('*', function (req, res) {
  res.json({error: "Cannot "+req.method+" "+req.originalUrl});
});

module.exports = router;
