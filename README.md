#  [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]

> Extractor module designed to extract data from a source.


## Install

```sh
$ npm install http-extractor --save
```


## Usage
The http-extractor is a module designed to work with the chrysalis framework - [https://github.com/APPrise-Mobile/chrysalis].  It is tasked with fetching data from a remote source.

```js
var httpExtractor = require('http-extractor');

var extractor = httpExtractor('http://remote-source.com');
extractor.extract();
```
or
```js
var httpExtractor = require('http-extractor');

var options = {
  url: 'http://remote-source.com',
  extractionPath: 'path.to.destination.object'
}
var extractor = httpExtractor(options);
extractor.extract();
```
if 'extractionPath' is set in the options, then the extractor will return a deep object GET on the path supplied.

#API
- **extractor.extract()** - Run the extraction process.

## License

MIT © [APPrise-Mobile]()


[npm-image]: https://badge.fury.io/js/http-extractor.svg
[npm-url]: https://npmjs.org/package/http-extractor
[travis-image]: https://travis-ci.org/frankros91/http-extractor.svg?branch=master
[travis-url]: https://travis-ci.org/frankros91/http-extractor
[daviddm-image]: https://david-dm.org/frankros91/http-extractor.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/frankros91/http-extractor
