"mode strict";
var express = require('express'),
  router = express.Router(),
  MongoClient = require('mongodb').MongoClient,
  mongoUrl = process.env.MONGOLAB_URI,
  request = require('request');



router.get('/', function (req, res) {
  var html=
    '<h1>FreeCodeCamp API Basejump: Image Search Abstraction Layer</h1>'+
    '<p>User stories:'+
    '<ol>'+
    '<li>I can get the image URLs, alt text and page urls for a set of images relating to a given search string.</li>'+
    '<li>I can paginate through the responses by adding a ?offset=2 parameter to the URL.</li>'+
    '<li>I can get a list of the most recently submitted search strings.</li>'+
    '</ol>'+
    '<p>Pro Tip:'+
    '<p>Checkout this <a href=https://github.com/FreeCodeCamp/FreeCodeCamp/wiki/Using-MongoDB-And-Deploying-To-Heroku>'+
    'wiki article</a> for tips on integrating MongoDB on Heroku.'+
    '<hr>'+

    '<h3>Examples.</h3>'+
    '<ol>'+

    '<li>'+
    '<p>Flickr search:</p>'+
    '<a href="fcc04/flickr-image-search-api/dogs and cats">https://ikarus512-fcc.herokuapp.com/fcc04/flickr-image-search-api/dogs and cats</a><br>'+
    '<p>will output first 10 results.'+
    '</li>'+

    '<li>'+
    '<p>Flickr search with paginating:</p>'+
    '<a href="fcc04/flickr-image-search-api/dogs and cats?offset=2">https://ikarus512-fcc.herokuapp.com/fcc04/flickr-image-search-api/dogs and cats?offset=2</a><br>'+
    '<p>will output 10 results starting from result 2.'+
    '</li>'+

    '<li>'+
    '<p>Google search:</p>'+
    '<a href="fcc04/google-image-search-api/dogs and cats">https://ikarus512-fcc.herokuapp.com/fcc04/google-image-search-api/dogs and cats</a><br>'+
    '<p>will output first 10 results.'+
    '</li>'+

    '<li>'+
    '<p>Google search with paginating:</p>'+
    '<a href="fcc04/google-image-search-api/dogs and cats?offset=2">https://ikarus512-fcc.herokuapp.com/fcc04/google-image-search-api/dogs and cats?offset=2</a><br>'+
    '<p>will output 10 results starting from result 2.'+
    '</li>'+

    '<li>'+
    '<p>List recent 10 searches:</p>'+
    '<a href="fcc04/api/latestsearch">https://ikarus512-fcc.herokuapp.com/fcc04/api/latestsearch</a><br>'+
    '</li>'+

    '<ol>';

  res.send(html);
});

//
//  /api/latestsearch
//
router.get("/api/latestsearch", function (req, res) {

  MongoClient.connect(mongoUrl, function(err, db) {
    if(err) {

      res.send({ "error": "Could not connect to MongoDB database." });

    } else {
      //
      // List 10 records, most recent, accordingly date field
      //
      db.collection('imgSearch')
      .find({date:{$not:{$type:2}}})
      .sort({date:-1})
      .limit(10)
      .toArray(function(err, r) {
        if(err) {

          res.send({ "error": err });

        } else if(r.length === 0) {

          //
          // Return existing records
          //

          res.send('Search database not populated yet.');

        } else {

          //
          // Return existing records
          //

          res.send(
            r.map(function(el) {
              return '' +
                '{ date: ' + (new Date(el.date)) +
                ', terms: "' + el.terms + '" ' +
                '}';
            }).join('<br>')
          );

        }

        db.close();

      });
    }
  });

});

//
//  /flickr-image-search-api/searchterms?offset=n
//
router.get(/^\/flickr-image-search-api\/.+/, function (req, res) {
  var searchstr = req.url.replace(/^\/flickr-image-search-api\//,'');

  var terms = decodeURI(searchstr.replace(/\?.*$/,''));

  var offset = searchstr.match(/\?offset=\d+$/,'');
  offset = (offset) ? (+offset[0].replace(/^\?offset=/,'')) : (0);

  var date = new Date().getTime();

  MongoClient.connect(mongoUrl, function(err, db) {
    if(err) {
      res.json({ "error": "Could not connect to MongoDB database.", terms: terms });
    } else {
      //
      // Add search terms to database
      //
      db.collection('imgSearch')
      .insertOne({ terms: terms, date: date }, function(err,r) {
        if( err || r.insertedCount!==1 ) {
          res.json({ "error": err });
        } else {
          doSearch(req, res, terms, offset);
        }
        db.close();
      });

    }

  });

  function doSearch(req, res, terms, offset) {
    // Do search.

    var page = 1 + Math.floor(offset / 20);
    var offset1 = offset - (page-1)*20;

    // Flickr API
    // Example call: https://www.flickr.com/services/api/explore/flickr.photos.search
    // Result format: https://www.flickr.com/services/api/misc.urls.html
    request.get(
      'https://api.flickr.com/services/rest/' +
      '?method=flickr.photos.search' +
      '&api_key=227fa1b8d084d4f9c2889b70911aa308' +
      '&tags=' + terms.split(' ').join('+') +
      '&per_page=20' +
      '&page='+page +
      '&format=json' +
      '&nojsoncallback=1' +
      // '&api_sig=a76473eada2f299af949f9cd8de83f53' +
      '',

      function(err, response, data) {

        if(err || response.statusCode !== 200) {

          res.json({ "error": err, statusCode: response.statusCode });

        } else {

          data = JSON.parse(data);

          //
          // Return search results
          //

          try{

            res.send(

              'Images ' + offset + '-' + (offset + 9) + ' of total ' + data.photos.total + '<br>' +

              data.photos.photo
              .filter( function(item,i) { return (i>=offset1)&&(i<offset1+10); })
              .map( function(el) {
                // { "id": "32827634826", "owner": "7702423@N04", "secret": "6b3459a11a", "server": "2140", "farm": 3, "title": "245\/365\/3167 (February 11, 2017) - Peaceful Kingdom (Flappy and Cosmo)", "ispublic": 1, "isfriend": 0, "isfamily": 0 },
                var src='https://farm'+el.farm+'.staticflickr.com/'+el.server+'/'+el.id+'_'+el.secret+'.jpg';
                var title = el.title;
                return '<h4>'+title+'</h4><a href="'+src+'"><img src="'+src+'"" alt="'+title+'" height=100></a>' +
                  '<br>' + JSON.stringify(el);
              }).join('')

            );

          } catch(err) {

            res.json({error: err, errId: 'Reason: flickr API changed.'});

          }

        }
      }
    );

  }

});

//
//  /google-image-search-api/searchterms?offset=n
//
router.get(/^\/google-image-search-api\/.+/, function (req, res) {
  var searchstr = req.url.replace(/^\/google-image-search-api\//,'');

  var terms = decodeURI(searchstr.replace(/\?.*$/,''));

  var offset = searchstr.match(/\?offset=\d+$/,'');
  offset = (offset) ? (+offset[0].replace(/^\?offset=/,'')) : (0);

  var date = new Date().getTime();

  MongoClient.connect(mongoUrl, function(err, db) {
    if(err) {
      res.json({ "error": "Could not connect to MongoDB database.", terms: terms });
    } else {
      //
      // Add search terms to database
      //
      db.collection('imgSearch')
      .insertOne({ terms: terms, date: date }, function(err,r) {
        if( err || r.insertedCount!==1 ) {
          res.json({ "error": err });
        } else {
          doSearch(req, res, terms, offset);
        }
        db.close();
      });

    }

  });

  function doSearch(req, res, terms, offset) {
    // Do search.

    // var page = 1 + Math.floor(offset / 20);
    // var offset1 = offset - (page-1)*20;

    // Flickr API
    // Example call: https://www.flickr.com/services/api/explore/flickr.photos.search
    // Result format: https://www.flickr.com/services/api/misc.urls.html
    request.get(
      'https://www.googleapis.com/customsearch/v1?' +
      'key=AIzaSyD58osN4_426fVbzc3J0nDU1eA4BlIr3tg' +
      '&cx=017576662512468239146:omuauf_lfve' +
      '&q=' + terms.split(' ').join('+') +
      // '?method=flickr.photos.search' +
      // '&api_key=227fa1b8d084d4f9c2889b70911aa308' +
      // '&tags=' + terms.split(' ').join('+') +
      // '&per_page=20' +
      // '&page='+page +
      // '&format=json' +
      // '&nojsoncallback=1' +
      // '&api_sig=a76473eada2f299af949f9cd8de83f53' +
      '',

      function(err, response, data) {

        if(err || response.statusCode !== 200) {

          res.json({ "error": err, statusCode: response.statusCode });

        } else {

          data = JSON.parse(data);

          //
          // Return search results
          //

          try{

res.send(JSON.stringify(data));
            // res.send(

            //   'Images ' + offset + '-' + (offset + 9) + ' of total ' + data.photos.total + '<br>' +

            //   data.photos.photo
            //   .filter( function(item,i) { return (i>=offset1)&&(i<offset1+10); })
            //   .map( function(el) {
            //     // { "id": "32827634826", "owner": "7702423@N04", "secret": "6b3459a11a", "server": "2140", "farm": 3, "title": "245\/365\/3167 (February 11, 2017) - Peaceful Kingdom (Flappy and Cosmo)", "ispublic": 1, "isfriend": 0, "isfamily": 0 },
            //     var src='https://farm'+el.farm+'.staticflickr.com/'+el.server+'/'+el.id+'_'+el.secret+'.jpg';
            //     var title = el.title;
            //     return '<h4>'+title+'</h4><a href="'+src+'"><img src="'+src+'"" alt="'+title+'" height=100></a>' +
            //       '<br>' + JSON.stringify(el);
            //   }).join('')

            // );

          } catch(err) {

            res.json({error: err, errId: 'Reason: flickr API changed.'});

          }

        }
      }
    );

  }

});

// *
router.all('*', function (req, res) {
  res.json({error: "Cannot "+req.method+" "+req.originalUrl});
});

module.exports = router;
