'use strict';

var q = require('q');
var parseString = require('xml2js').parseString;

exports.jsonifyXml = function jsonifyXml(xmlData) {
  var deferred = q.defer();
  parseString(xmlData, {
    async: true,
    explicitArray: false
  }, function (err, result) {
    if (!!err) {
      return deferred.reject(err);
    }
    deferred.resolve(result);
  });
  return deferred.promise;
};
