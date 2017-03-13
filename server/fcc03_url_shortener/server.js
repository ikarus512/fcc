"mode strict";
var express = require('express'),
  router = express.Router(),
  MongoClient = require('mongodb').MongoClient,
  mongoUrl = process.env.MONGOLAB_URI,
  shortUrlPrefix = "https://ikarus512-fcc.herokuapp.com/fcc03/";


router.get('/', function (req, res) {
  var html=
    '<h1>FreeCodeCamp API Basejump: URL Shortener Microservice</h1>'+
    '<p>User stories:'+
    '<ol>'+
    '<li>I can pass an URL as a parameter and I will receive a shortened URL in the JSON response.</li>'+
    '<li>If I pass an invalid URL, the JSON response will contain an error instead.</li>'+
    '<li>When I visit that shortened URL, it will redirect me to my original link.</li>'+
    '</ol>'+
    '<p>Pro Tip:'+
    '<p>Checkout this <a href=https://github.com/FreeCodeCamp/FreeCodeCamp/wiki/Using-MongoDB-And-Deploying-To-Heroku>'+
    'wiki article</a> for tips on integrating MongoDB on Heroku.'+
    '<hr>'+

    '<h3>Examples.</h3>'+
    '<ol>'+

    '<li>'+
    '<p>Create shortcut:</p>'+
    '<a href="fcc03/new/https://www.google.com">https://ikarus512-fcc.herokuapp.com/fcc03/new/https://www.google.com</a><br>'+
    '<p>output:</p>'+
    '<pre>{"original_url":"https://www.google.com","short_url":"https://ikarus512-fcc.herokuapp.com/fcc03/0"}</pre>'+
    '</li>'+

    '<li>'+
    '<p>Use shortcut:</p>'+
    '<a href="fcc03/0">https://ikarus512-fcc.herokuapp.com/fcc03/0</a><br>'+
    '<p>will redirect to:</p>'+
    '<pre>https://www.google.com</pre>'+
    '</li>'+

    '<li>'+
    '<p>List last 10 shortcuts:</p>'+
    '<a href="fcc03/list">https://ikarus512-fcc.herokuapp.com/fcc03/list</a><br>'+
    '</li>'+

    '<li>'+
    '<p>List 10 shortcuts starting from 5 one:</p>'+
    '<a href="fcc03/list/5">https://ikarus512-fcc.herokuapp.com/fcc03/list/5</a><br>'+
    '</li>'+

    '<ol>';

  res.send(html);
});

// /list
// /list/:id
router.get(/^\/list(\/\d*)?/, function (req, res) {
  var url = req.url.replace(/^\/list\/?/,'');
  var n = Number(url);

  MongoClient.connect(mongoUrl, function(err, db) {
    if(err) {

      res.send({ "error": "Could not connect to MongoDB database." });

    } else {
      if(n===0) {
        //
        // List last 10 records
        //
        db.collection('urlShortener')
        .find({})
        .sort({_id:-1})
        .limit(10)
        .toArray(function(err, r) {
          if(err) {

            res.send({ "error": err });

          } else {
            //
            // Return existing records
            //

            res.send( "Recent 10 shortcuts:<br>" +
              r.map(function(el) {
                return shortUrlPrefix + el._id+" --> "+el.url;
              }).join("<br>")
            );

          }

          db.close();

        });

      } else {

        //
        // List 10 records starting from _id===n
        //
        db.collection('urlShortener')
        .find({_id:{$not:{$type:2}}, _id:{$gte:n}})
        .sort({_id:1})
        .limit(10)
        .toArray(function(err, r) {
          if(err) {

            res.send({ "error": err });

          } else {
            //
            // Return existing records
            //

            res.send( "Shortcuts " + n + "-" + (n+10) + ":<br>" +
              r.map(function(el) {
                return shortUrlPrefix + el._id+" --> "+el.url;
              }).join("<br>")
            );

          }

          db.close();

        });
      }
    }
  });

});

// /new/url
router.get(/^\/new\/.+/, function (req, res) {
  var url = req.url.replace(/^\/new\//,'');

  MongoClient.connect(mongoUrl, function(err, db) {
    if(err) {
      res.json({ "error": "Could not connect to MongoDB database." });
    } else {
      //
      // Check if url already present in database
      //
      var urlShortener = db.collection('urlShortener');
      urlShortener
      .find({url: url})
      .limit(1)
      .toArray(function(err, r) {
        if(err) {

          res.json({ "error": err, n:1 });

        } else if(r.length>0) {
          //
          // Return existing record
          //

          res.json({ "original_url": r[0].url, "short_url": shortUrlPrefix + r[0]._id });

        } else {
          //
          // Url is not yet in database. Add it. And return added record.
          //

          // Find next_id (i.e. max _id + 1)
          urlShortener
          .find({_id:{$not:{$type:2}}})
          .sort({_id:-1})
          .limit(1)
          .toArray( function(err, r) {
            if( err ) {
              res.json({ "error": err, n:2 });
              db.close();
            } else {
              var next_id;
              if( r.length===0 ) next_id = 0;
              else next_id = r[0]._id + 1;

              // Add new record at _id===next_id.
              urlShortener
              .insertOne({ _id: next_id, url: url }, function(err,r) {
                if( err || r.insertedCount!==1 ) {
                  res.json({ "error": err, n:3 });
                } else {
                  res.json({ "original_url": url, "short_url": shortUrlPrefix + next_id});
                }
                db.close();
              });
            }

          });

        }

      });

    }

  });

});

// /:id
router.get(/^\/\d+$/, function (req, res) {
  var id = Number(req.url.replace(/^\//,''));

  MongoClient.connect(mongoUrl, function(err, db) {
    if(err) {

      res.json({ "error": "Could not connect to MongoDB database." });

    } else {
      //
      // Find shortcut with _id===id
      //
      db.collection('urlShortener')
      .find({_id:id})
      .limit(1)
      .toArray(function(err, r) {
        if( err ) {

          res.json({"error": err});

        } else if( r.length===0 ) {

          res.json({"error":"The url with id "+id+" is not on the database."});

        } else {
          //
          // Redirect to the found url
          //

          res.redirect( r[0].url );

        }

        db.close();

      });
    }
  });

});

// *
router.all('*', function (req, res) {
  res.json({error: "Cannot "+req.method+" "+req.originalUrl});
});

module.exports = router;
