"mode strict";
var express = require('express'),
  app = express(),
  bodyParser = require('body-parser'),

  fcc01_timestamp = require('./fcc01_timestamp/server.js'),
  fcc02_header_parser = require('./fcc02_header_parser/server.js'),
  fcc03_url_shortener = require('./fcc03_url_shortener/server.js'),
  fcc04_image_search = require('./fcc04_image_search/server.js'),
  fcc05_file_upload = require('./fcc05_file_upload/server.js');



app.set('port', (process.env.PORT || 5000));

app.enable('trust proxy'); // to get req.ip

app.use(bodyParser.urlencoded({ extended: true })); 
app.use(bodyParser.json());



app.get('/', function (req, res) {
  var html=
    '<h1>API Basejump:</h1>'+
    '<ul>'+
    '<li><a href="fcc01">fcc01</a> Timestamp Microservice</li>'+
    '<li><a href="fcc02">fcc02</a> Request Header Parser Microservice</li>'+
    '<li><a href="fcc03">fcc03</a> URL Shortener Microservice</li>'+
    '<li><a href="fcc04">fcc04</a> Image Search Abstraction Layer</li>'+
    '<li><a href="fcc05">fcc05</a> Uploaded File Metadata Microservice</li>'+
    '</ol>';

  res.send(html);
});

app.use('/fcc01', fcc01_timestamp);
app.use('/fcc02', fcc02_header_parser);
app.use('/fcc03', fcc03_url_shortener);
app.use('/fcc04', fcc04_image_search);
app.use('/fcc05', fcc05_file_upload);

// *
app.all('*', function (req, res) {
  res.send("Error: cannot " + req.method + " " + req.url);
});

app.listen(app.get('port'), function () {
  console.log('Example app listening on port '+app.get('port')+' (https)!');
});
