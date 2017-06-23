/*jshint node: true*/
'use strict';

module.exports = function myEnableCORS(req, res, next) {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  // res.header('Access-Control-Max-Age', '3600');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Credentials', true);
  if ('OPTIONS' === req.method) {
    res.sendStatus(200);
  } else {
    next();
  }
};
