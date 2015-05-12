'use strict';

var sinon = require('sinon');
var httpExtractor = require('./index');
var q = require('q');
var nock = require('nock');
var _ = require('lodash');

describe('HTTP Extractor', function() {
  var sandbox, jsonResponse, extractorOptions;

  beforeEach(function() {
    jsonResponse = { test: {
        data: {
          deep: {
            data: 'test'
          }
        }
      }
    };

    extractorOptions = {
      url: 'http://google.com/geturl',
      extractionPath: 'test.data.deep.data'
    };

    nock('http://google.com')
      .get('/geturl')
      .once()
      .reply(200, jsonResponse);
  });

  afterEach(function() {
    nock.cleanAll();
  });

  it('should reject if extract() is called without passing in a url on instatiation', function() {
    (function() {
      httpExtractor();
    }).should.throw('invalid web url');
  });

  it('should error out if the options parameter does not contain a url key', function() {
    var options = {
      extractionPath: 'path.to.object'
    };
    (function() {
      httpExtractor(options);
    }).should.throw('invalid web url');
  });

  it('should not reject if the options parameter does not contain the optional extractionPath key', function(done) {
    var options = {
      url: 'http://google.com/geturl'
    };
    var extractor = httpExtractor(options);
    extractor.extract()
      .then(function() {
        done();
      });
  });

  it('should extract the data given by the extractionPath passed into the extractor', function(done) {
    var extractor = httpExtractor(extractorOptions);
    extractor.extract()
      .then(function(data) {
        data.should.equal('test');
        done();
      });
  });

  it('should reject when the http response does not contain a status code of 200', function(done) {
    nock.cleanAll();
    nock('http://google.com')
      .get('/geturl')
      .once()
      .reply(500, '<?xml version="1.0"?><test><data><deep><data>test</data></deep></data></test>',
        {
          'content-type': 'text/xml'
        });
    var extractor = httpExtractor(extractorOptions);
    extractor.extract()
      .then(null, function(err) {
        _.isObject(err).should.equal(true);
        err.error.should.equal('STATUS_CODE_ERROR');
        done();
      });
  });

  it('should reject when the http response content-type header comes back an invalid type', function(done) {
    nock.cleanAll();
    nock('http://google.com')
      .get('/geturl')
      .once()
      .reply(200, '<?xml version="1.0"?><test><data><deep><data>test</data></deep></data></test>',
        {
          'content-type': 'text/invalid'
        });
    var extractor = httpExtractor(extractorOptions);
    extractor.extract()
      .then(null, function(err) {
        _.isObject(err).should.equal(true);
        err.message.should.equal('invalid response format');
        done();
      });
  });

  it('should parse the xml response to a json object', function(done) {
    nock.cleanAll();
    nock('http://google.com')
      .get('/geturl')
      .once()
      .reply(200, '<?xml version="1.0"?><test><data><deep><data>test</data></deep></data></test>',
        {
          'content-type': 'text/xml'
        });

    var options = {
      url: 'http://google.com/geturl',
      extractionPath: 'test.data.deep'
    };
    var extractor = httpExtractor(options);
    extractor.extract()
      .then(function(result) {
        _.isObject(result).should.equal(true);
        result.data.should.equal('test');
        done();
      });
  });

  it('should parse the text/plain response to a json object', function(done) {
    nock.cleanAll();
    var stringified = JSON.stringify(jsonResponse);
    nock('http://google.com')
      .get('/geturl')
      .once()
      .reply(200, stringified, {
        'content-type': 'text/plain'
      });

    var options = {
      url: 'http://google.com/geturl',
      extractionPath: 'test.data.deep'
    };
    var extractor = httpExtractor(options);
    extractor.extract()
      .then(function(result) {
        _.isObject(result).should.equal(true);
        result.data.should.equal('test');
        done();
      })
      .then(null, done);
  });

  it('should parse the application/json response as a json object', function(done) {
    var options = {
      url: 'http://google.com/geturl',
      extractionPath: 'test.data.deep'
    };
    var extractor = httpExtractor(options);
    extractor.extract()
      .then(function(result) {
        _.isObject(result).should.equal(true);
        result.data.should.equal('test');
        done();
      })
      .then(null, done);
  });
});
