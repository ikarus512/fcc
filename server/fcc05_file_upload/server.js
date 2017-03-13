"mode strict";
var express = require('express'),
  router = express.Router(),
  fs = require('fs'),
  multer = require('multer'),
  upload = multer({ dest: './' });



router.get('/', function (req, res) {
  var html=
    '<h1>FreeCodeCamp API Basejump: Uploaded File Metadata Microservice</h1>' +
    '<p>User stories:' +
    '<ol>' +
    '<li>I can submit a FormData object that includes a file upload.</li>' +
    '<li>When I submit something, I will receive the file size in bytes within the JSON response.</li>' +
    '</ol>' +
    '<p>Hint:' +
    '<p>You may want to use <a href=https://www.npmjs.com/package/multer> multer </a> package.' +

    '<hr>' +

    '<p>Submit a file to view its filesize:</p>' +
    '<form action="fcc05/get-file-size" method="post" enctype="multipart/form-data">' +
    '  <input type="file" name="file" required>' +
    '  <input type="submit">' +
    '</form>';

  res.send(html);
});

//
//  /get-file-size
//
router.post("/get-file-size", upload.single('file'), function (req, res) {

  if(req.file) {

    // Remove uploaded file
    fs.unlink(req.file.path, function(err) {
      if(err) {
        console.log(err);
        console.log('Error: cannot delete just uploaded file ' + req.file.path);
      }
      console.log('Successfully deleted just uploaded file ' + req.file.path);
    });

    // Report uploaded file size
    res.json({ size: req.file.size });

  } else {

    res.json({ error: "No file chosen." });

  }
});

// *
router.all('*', function (req, res) {
  res.json({error: "Cannot "+req.method+" "+req.originalUrl});
});

module.exports = router;
