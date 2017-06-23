"mode strict";
var express = require('express'),
  fs = require('fs'),
  router = express.Router(),
  request = require('request'),
  myEnableCORS = require('./my-enable-cors.js');

router
.all(/^\/w\/.+/, myEnableCORS)
.get(/^\/w\/.+/, function (req, res) {
  var searchstr = req.url.replace(/^\/w\//,''),
    arr_temperature,
    arr_precip_val,
    arr_precip_ver,
    arr_wind_speed,
    arr_pressure,
    arr_humidity,
    arr_phenomenon_name;

  if (process.env.APP_URL !== 'https://ikarus512-fcc.herokuapp.com') {
    var data = require('./1.js');
    processData(res, data);
  } else {
    request.get(
      'http://meteoinfo.ru/forecasts5000/russia/'+searchstr,
      //'http://meteoinfo.ru/forecasts5000/russia/moscow-area/moscow',
      //'http://meteoinfo.ru/forecasts5000/russia/nizhegorodskaya-area',
      function(err, response, data) {
        if(err || response.statusCode !== 200) {
          res.json({ "error": err, statusCode: response.statusCode });
        } else {
          processData(res, data);
        }
      }
    );
  }

  function extractVal(str,name) {
    var re = new RegExp(name+'=(\\[\\{[^;]*);', 'i');
    var s;
    try {
      s = eval(str.match(re)[1]);
    } catch(err) {
    }
    return s;
  }

  function processData(res, data) {
    try {
      // data = require('./1.js'),
      arr_temperature= extractVal(data, 'arr_temperature');
      arr_precip_val = extractVal(data, 'arr_precip_val');
      arr_precip_ver = extractVal(data, 'arr_precip_ver');
      arr_wind_speed = extractVal(data, 'arr_wind_speed');
      arr_pressure   = extractVal(data, 'arr_pressure');
      arr_humidity   = extractVal(data, 'arr_humidity');
      arr_phenomenon_name   = extractVal(data, 'arr_phenomenon_name');



      res.json({
        searchstr,
        arr_temperature,
        arr_precip_val,
        arr_precip_ver,
        arr_wind_speed,
        arr_pressure,
        arr_humidity,
        arr_phenomenon_name,
      });

    } catch(err) {
      res.json({err});
    }
  }

});

// *
router.all('*', function (req, res) {
  res.json({error: "Cannot "+req.method+" "+req.originalUrl});
});

module.exports = router;
