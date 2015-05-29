#!/usr/bin/env node
'use strict';
var meow = require('meow');
var httpExtractor = require('./lib');

var cli = meow({
  help: [
    'Usage',
    '  testcli <input>',
    '',
    'Example',
    '  testcli Unicorn'
  ].join('\n')
});

var url = cli.flags.u;
var extractionPath = cli.flags.e;
var logLevel = cli.flags.l;

var extractorOptions = {
  url: url,
  extractionPath: extractionPath,
  logLevel: logLevel
};

var extractor = httpExtractor(extractorOptions);
extractor.extract()
  .then(function() {
    process.exit();
  })
  .then(null, function(reason) {
    console.log('ERROR');
    console.log(reason);
    process.exit(reason);
  });


