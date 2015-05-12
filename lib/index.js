'use strict';

var q = require('q');
var _ = require('lodash');
var _deep = require('lodash-deep');
var url = require('url');
var request = require('request');
var validUrl = require('valid-url');
var xmlService = require('../xml');

module.exports = function HTTPExtractor(options) {
  var feedUrl, extractionPath;

  if(_.isString(options)) {
    feedUrl = options;
  } else if (_.has(options, 'url') && _.isString(options.url)) {
    feedUrl = options.url;
  }
  if(_.isUndefined(validUrl.is_web_uri(feedUrl))) {
      throw new Error('invalid web url');
  }
  if(_.has(options, 'extractionPath') && _.isString(options.extractionPath)) {
    extractionPath = options.extractionPath;
  }

  var getFeed = function getFeed() {
    var requestOpts = {
      uri: feedUrl,
      method: 'GET',
      json: true
    };

    var deferred = q.defer();
    request(requestOpts, function(err, res) {
      if(!!err) {
        deferred.reject(err);
      } else if (!(/^2/.test('' + res.statusCode))) {
        deferred.reject({
          error: 'STATUS_CODE_ERROR',
          response: res
        });
      } else {
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
      return response.body;
    }
    var format = getResponseFormat(response.headers['content-type']);
    if(format === 'xml') {
      return xmlService.jsonifyXml(response.body);
    }
    throw new Error('invalid response format', response);
  };

  var extractFeed = function extractFeed(jsonData) {
    if(_.isUndefined(extractionPath)) {
      return q.resolve(jsonData);
    } else {
      return _deep.deepGet(jsonData, extractionPath);
    }
  };

  var extract = function extract() {
    return getFeed()
        .then(jsonifyFeed)
        .then(extractFeed);
  };

  return {
    extract: extract
  };
};
