'use strict';

var os = require('os');
var fs = require('fs');
var _ = require('underscore');
var async = require('async');
var asynquence = require('asynquence');
var CronJob = require('cron').CronJob;
var config = require('../config');
var DIR = config.get(['formidable', 'uploadDir'], os.tmpDir()) + '/';
var EXTENSIONS = ['png', 'PNG', 'jpg', 'JPG', 'jpeg', 'JPEG', 'gif', 'GIF'];
var SECOND = 1000;
var MINUTE = 60 * SECOND;
var HOUR = 60 * MINUTE;

new CronJob('0 0 */6 * * *', onTick, onEnd, true);

function onEnd() {
    console.log('[OLX_DEBUG]', 'cron', 'tmp', 'end');
}

function onTick(end) {
    console.log('[OLX_DEBUG]', 'cron', 'tmp', 'start');
    asynquence().or(error)
        .then(read)
        .then(filter)
        .then(unlink)
        .val(end);

    function read(done) {
        fs.readdir(DIR, done.errfcb);
    }

    function filter(done, files) {
        async.filter(files, _filter, done);

        function _filter(file, callback) {
            var extension = file.split('.').pop();

            if (!_.contains(EXTENSIONS, extension)) {
                return callback(false);
            }
            asynquence().or(done.fail)
                .then(stat)
                .val(evaluate);

            function stat(done) {
               fs.stat(DIR + file, done.errfcb);
            }

            function evaluate(stats) {
                var now = new Date().getTime();
                var time = stats.mtime.getTime();
                var diff = now - time;

                callback(diff > HOUR);
            }
        }
    }

    function unlink(done, files) {
        async.each(files, _unlink, done.errfcb);

        function _unlink(file, callback) {
            fs.unlink(DIR + file, callback);
        }
    }

    function error(err) {
        end();
    }
}

module.exports = onTick;
