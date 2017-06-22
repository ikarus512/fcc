"mode strict";
var express = require('express'),
  fs = require('fs'),
  router = express.Router(),
  request = require('request');

router.get(/^\/w\/.+/, function (req, res) {
  var searchstr = req.url.replace(/^\/w\//,''),
    arr_temperature, arr_precip_val, arr_precip_ver;

  request.get(
    'http://meteoinfo.ru/forecasts5000/russia/'+searchstr,
    //'http://meteoinfo.ru/forecasts5000/russia/moscow-area/moscow',
    //'http://meteoinfo.ru/forecasts5000/russia/nizhegorodskaya-area',
    function(err, response, data) {
      if(err || response.statusCode !== 200) {
        res.json({ "error": err, statusCode: response.statusCode });
      } else {
        // data = JSON.parse(data);
        // res.json(data);

        try {
          // data = require('./1.js'),
          arr_temperature = extractVal(data, 'arr_temperature');
          arr_precip_val = extractVal(data, 'arr_precip_val');
          arr_precip_ver = extractVal(data, 'arr_precip_ver');

          res.json({searchstr,arr_temperature,arr_precip_val,arr_precip_ver});

        } catch(err) {
          res.json({err});
        }


      }
    }
  );

  function extractVal(str,name) {
    var re = new RegExp(name+'=(\\[\\{[^;]*);', 'i');
    var s;
    try {
      s = eval(str.match(re)[1]);
    } catch(err) {
    }
    return s;
  }

});

// *
router.all('*', function (req, res) {
  res.json({error: "Cannot "+req.method+" "+req.originalUrl});
});

module.exports = router;
