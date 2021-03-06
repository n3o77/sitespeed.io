/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
var fs = require('fs-extra'),
  path = require('path'),
  log = require('winston');

function Collector(config) {
  this.aggregators = [];
  this.collectors = [];
  registerAggregators(config, this.aggregators);
  registerCollectors(config, this.collectors);
}

function registerAggregators(config, aggregators) {

  var types = [];

  if (config.runYslow) {
    types.push('yslow');
    types.push('phantomjs');
  }
  if (config.browser) {
    types.push('browsertime', 'har');
  }
  if (config.gpsiKey) {
    types.push('gpsi');
  }
  if (config.wptUrl) {
    types.push('webpagetest');
  }

  types.forEach(function(type) {
    var rootPath = path.join(__dirname, 'aggregators', type, path.sep);
    fs.readdirSync(rootPath).forEach(function(file) {
      aggregators.push(require(rootPath + file));
    });
  });

  if (config.aggregators) {
    fs.readdirSync(config.aggregators).forEach(function(file) {
      aggregators.push(require(config.aggregators + file));
    });
  }
}

function registerCollectors(config, collectors) {
  var rootPath = path.join(__dirname, 'collectors', path.sep);
  fs.readdirSync(rootPath).forEach(function(file) {
    collectors.push(require(rootPath + file));
  });
  if (config.collectors) {
    fs.readdirSync(config.collectors).forEach(function(file) {
      collectors.push(require(config.collectors + file));
    });
  }
}

Collector.prototype.createAggregates = function() {
  var aggregates = [];
  this.aggregators.forEach(function(a) {
    // if one of the values fails, we want to log & move on
    try {
      var result = a.generateResults();
      if (Array.isArray(result)) {
        result.forEach(function(b) {
          aggregates.push(b);
        });
      } else {
        aggregates.push(result);
      }
    } catch (err) {
      log.log('error', 'Could not fetch data for aggregator:' + a.id + ' err:' + err);
    }

  });
  return aggregates;
};

Collector.prototype.clear = function() {

  this.collectors.forEach(function(c) {
    c.clear();
  });

  this.aggregators.forEach(function(a) {
    a.clear();
  });

};

Collector.prototype.createCollections = function() {
  var collections = {};

  this.collectors.forEach(function(c) {
    var collection = c.generateResults();
    collections[collection.id] = collection.list;
  });
  return collections;
};

Collector.prototype.collectPageData = function(pageData) {
  this.aggregators.forEach(function(a) {
    try {
      a.processPage(pageData);

    } catch (err) {
      log.log('error', 'Could not fetch data for aggregator:' + a.id + ' err:' +
        err);
    }
  });

  this.collectors.forEach(function(c) {
    c.processPage(pageData);
  });

};

module.exports = Collector;
