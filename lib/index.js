'use strict';

var q = require('q');
var _ = require('lodash');
var _deep = require('lodash-deep');
var url = require('url');
var request = require('request');
var xmlService = require('../xml');
var bunyan = require('bunyan');

var initLogger = function initLogger(logLevel) {
  var stream = [{
    level: logLevel,
    stream: process.stdout
  }];
  return bunyan.createLogger({
    name: 'http-extractor',
    streams: stream
  });
};

module.exports = function HTTPExtractor(options) {
  var feedUrl, extractionPath, logLevel, log;
  if(_.isUndefined(options)) {
    throw new Error('invalid web url');
  }
  if(_.isString(options)) {
    feedUrl = options;
  } else if (_.isString(options.url)) {
    feedUrl = options.url;
  }
  if(_.isString(options.extractionPath)) {
    extractionPath = options.extractionPath;
  }

  logLevel = process.env.LOG_LEVEL || 'error';
  if(_.isString(options.logLevel)) {
    logLevel = options.logLevel;
  }
  log = initLogger(logLevel);

  var getFeed = function getFeed() {
    var requestOpts = {
      uri: feedUrl,
      method: 'GET',
      json: true
    };

    var deferred = q.defer();
    log.info('getting feed');
    request(requestOpts, function(err, res) {
      if(!!err) {
        deferred.reject(err);
      } else if (!(/^2/.test('' + res.statusCode))) {
        deferred.reject({
          error: 'STATUS_CODE_ERROR',
          response: res
        });
      } else {
        log.info('retrieved feed');
        log.trace(res);
        log.debug(res.body);
        deferred.resolve(res);
      }
    });
    return deferred.promise;
  };

  var getResponseFormat = function getResponseFormat(contentType) {
    var format;
    if(_.contains(contentType, 'xml')) {
      format = 'xml';
    } else if (_.contains(contentType, 'json')) {
      format = 'json';
    } else if (_.contains(contentType, 'plain')) {
      format = 'string';
    }
    return format;
  };

  var jsonifyFeed = function jsonifyFeed(response) {
    if(_.isObject(response.body)) {
      return q.resolve(response.body);
    }
    var format = getResponseFormat(response.headers['content-type']);
    if(format === 'xml') {
      return xmlService.jsonifyXml(response.body)
        .then(function (jsonBody) {
          log.info('feed jsonified');
          log.debug(jsonBody);
          return jsonBody;
        });
    }
    log.error('invalid response format', response);
    throw new Error('invalid response format', response);
  };

  var extractFeed = function extractFeed(jsonData) {
    if(_.isUndefined(extractionPath)) {
      return q.resolve(jsonData);
    } else {
      var finalData = _deep.deepGet(jsonData, extractionPath);
      if(_.isUndefined(finalData)) {
        throw new Error('HTTP-Extractor: extraction path does not exist');
      } else {
        return q.resolve(finalData);
      }
    }
  };

  var extract = function extract() {
    return getFeed()
        .then(jsonifyFeed)
        .then(extractFeed)
        .then(function(data) {
          log.info('extraction complete');
          log.debug(data, 'final data');
          return data;
        });
  };

  return {
    extract: extract
  };
};
