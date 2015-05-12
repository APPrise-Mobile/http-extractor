'use strict';

var XmlService = require('./xml.service');

describe('Xml Service', function() {

   it('should parse xml to a json object', function(done){
     var xml = '<site><module><title>Module Title</title></module></site>';
     XmlService.jsonifyXml(xml)
       .then(function(json) {
         should.exist(json);
         should.exist(json.site);
         should.exist(json.site.module);
         json.site.module.title.should.equal('Module Title');
         done();
       })
       .catch(function(reason) {
         done(reason);
       });
   });

});