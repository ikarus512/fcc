"mode strict";
var express = require('express'),
  router = express.Router();

router.get('/', function (req, res) {
  var html=
    '<h1>FreeCodeCamp API Basejump: Timestamp Microservice</h1>'+
    '<p>User stories:'+
    '<ol>'+
    '<li>I can pass a string as a parameter, and it will check to see whether that string contains either a unix timestamp or a natural language date (example: January 1, 2016)</li>'+
    '<li>If it does, it returns both the Unix timestamp and the natural language form of that date.</li>'+
    '<li>If it does not contain a date or Unix timestamp, it returns null for those properties.</li>'+
    '</ol>'+
    '<hr>'+

    '<p>Example usage:</p>'+
    '<a href="fcc01/December%2015,%202015">https://ikarus512-fcc.herokuapp.com/fcc01/December 15, 2015</a><br>'+
    '<a href="fcc01/1450137600">https://ikarus512-fcc.herokuapp.com/fcc01/1450137600</a><br>'+
    '<a href="fcc01/err">https://ikarus512-fcc.herokuapp.com/fcc01/err</a><br>'+

    '<p>Example output:</p>'+
    '<pre>{ "unix": 1450137600, "natural": "December 15, 2015" }</pre>'+
    '<p>Error output:</p>'+
    '<pre>{ "unix": null, "natural": null }</pre>';

  res.send(html);
});

router.get('/*', function (req, res) {

  var str, date, unix, natural;

  try {
    str = decodeURI(req.url.replace(/^\/*/g,''));

    if(str.match(/^[+-]?\d+$/)) {
      // Here if unix date given

      unix = Number(str); // Seconds since 1970/01/01 (UTC)

      date = new Date(unix*1000); // Convert UTC time in milliseconds to UTC time

      date = new Date(date.getTime() + date.getTimezoneOffset()*60*1000); // convert to server local time
        // just for consistency with expected result, but not needed in real life

    } else {
      // Here if date is natural

      date = new Date(str); // convert to server local time
      var date1 = new Date(date.getTime() - date.getTimezoneOffset()*60*1000); // convert to UTC time

      unix = Math.floor(date1.getTime() / 1000); // get UTC time in seconds since 1970/01/01

    }

    if(unix || unix===0) {
      var month = ['January','February','March','April','May','June',
        'July','August','September','October','November','December'];
      natural = month[date.getMonth()]+' '+date.getDate()+', '+date.getFullYear();
    } else {
      unix = null;
      natural = null;
    }    

  } catch(err) {
    console.log(err.message);
    unix = null;
    natural = null;
  }

  var data = {
    unix: unix,
    natural: natural,
  };

  res.send(JSON.stringify(data));
});

// *
router.all('*', function (req, res) {
  res.json({error: "Cannot "+req.method+" "+req.url});
});

module.exports = router;
