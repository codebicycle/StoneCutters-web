var fs = require('fs');
var _ = require('underscore');
var async = require('async');
var asynquence = require('asynquence');
var CronJob = require('cron').CronJob;
var dir = '/tmp/';
var extensions = ['png', 'PNG', 'jpg', 'JPG', 'jpeg', 'JPEG', 'gif', 'GIF'];
var SECOND = 1000;
var MINUTE = 60 * SECOND;
var HOUR = 60 * MINUTE;
var DAY = 24 * HOUR;
var MONTH = 30 * DAY;

new CronJob('0 0 */3 * * *', onTick, onEnd, true);

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
        fs.readdir(dir, done.errfcb);
    }

    function filter(done, files) {
        async.filter(files, _filter, done);

        function _filter(file, callback) {
            var extension = file.split('.').pop();

            if (!_.contains(extensions, extension)) {
                return callback(false);
            }
            asynquence().or(done.fail)
                .then(stat)
                .val(evaluate);

            function stat(done) {
               fs.stat(dir + file, done.errfcb);
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
            fs.unlink(dir + file, callback);
        }
    }

    function error(err) {
        console.log('[OLX_DEBUG]', 'cron', 'tmp', 'err', err);
        end();
    }
}

module.exports = onTick;
