/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */

var path = require('path'),
  util = require('../util/util'),
  fs = require('fs'),
  pagespeed = require('gpagespeed'),
  log = require('winston'),
  async = require('async');

module.exports = {
  analyze: function(urls, config, callback) {

    var gpsiResultDir = path.join(config.run.absResultDir, config.dataDir, 'gpsi');
    fs.mkdir(gpsiResultDir, function(err) {
      if (err) {
        log.log('error', 'Could not create gpsi result dir: ' + gpsiResultDir + ' ' + err);
        callback(err, {
          'type': 'gpsi',
          'data': {},
          'errors': {}
        });
      } else {
        var queue = async.queue(analyzeUrl, config.threads);
        var errors = {};
        var pageData = {};

        urls.forEach(function(u) {
          queue.push({
            'url': u,
            'config': config
          }, function(data, err) {
            if (err) {
              log.log('error', 'Error running gpsi: ' + err);
              errors[u] = err;
            } else {
              pageData[u] = data;
            }
          });
        });

        queue.drain = function() {
          callback(undefined, {
            'type': 'gpsi',
            'data': pageData,
            'errors': errors
          });
        };

      }
    });
  }
};

function analyzeUrl(args, asyncDoneCallback) {
  var url = args.url;
  var config = args.config;
  var opts = {
    url: url,
    strategy: config.profile,
    key: config.gpsiKey
  };

  log.log('info', 'Running Google Page Speed Insights for ' + url);

  pagespeed(opts, function(err, data) {

    if (err) {
      log.log('error', 'Error running gpsi:' + url + '(' + err + ')');
      asyncDoneCallback(undefined, err);
      return;
    }

    // did we get an error JSON?
    var result = JSON.parse(data);

    if (result.error) {
      // TODO parse the error
      log.log('error', 'Error running gpsi:' + url + '(' + data + ')');
      asyncDoneCallback(undefined, result.error.message);
    } else {
      var jsonPath = path.join(config.run.absResultDir, config.dataDir,
        'gpsi',
        util.getFileName(url) + '-gpsi.json');

      fs.writeFile(jsonPath, data, function(err) {
        if (err) {
          log.log('error', 'GPSI couldnt store file for url ' + url + '(' +
            err + ')');
          asyncDoneCallback(undefined, err);
        } else {
          asyncDoneCallback(result, undefined);
        }
      });
    }

  });
}