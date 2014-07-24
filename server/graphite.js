'use strict';

var config = require('./config').get('graphite', {
    client: {
        host: '127.0.0.1',
        port: 2003,
        debug: false,
        interval: 10000,
        type: 'udp4'
    }
});
var dgram = require('dgram');
var util = require('util');
var logger = require('../shared/logger')('graphite');
var client;

function Client(options) {
    var queue = {};
    var tid = 0;
    var socket;

    function init() {
        function onClose() {
            logger.log('UDP socket closed');
        }

        function onError(err) {
            logger.error('UDP socket error: '+ err);
        }

        options = util._extend(config.client, options);
        socket = dgram.createSocket(options.type);
        socket.on('close', onClose);
        socket.on('error', onError);
        logger.log('Creating new Graphite UDP client');

        return {
            send: addMetric
        };
    }

    function addMetric(name, value, timestamp, operation, callback) {
        var date;

        if (timestamp instanceof Function) {
            callback = timestamp;
            operation = null;
        }
        else if (operation instanceof Function || (timestamp && !operation)) {
            callback = operation;
            date = new Date(timestamp);
            if (isNaN(date.getTime())) {
                date = null;
                operation = timestamp;
            }
            else {
                operation = null;
            }
        }
        if (!date) {
            date = new Date();
        }
        if (!operation) {
            operation = '=';
        }
        timestamp = String(date.getTime()).substr(0, 10);
        if (Array.isArray(name)) {
            name = name.join('.');
        }
        name = [config.namespace, name].join('.');
        if(typeof queue[name] === 'undefined') {
            queue[name] = {
                value: value
            };
        }
        else {
            switch (operation) {
                case '+':
                    queue[name].value += value;
                break;
                case '-':
                    queue[name].value -= value;
                break;
                default:
                    queue[name].value = value;
                break;
            }
        }
        queue[name].timestamp = timestamp;
        logger.log('Adding metric to queue: '+ name +' '+ value);
        if(tid === 0) {
            tid = setTimeout(function() {
                send(callback);
            }, options.interval);
        }
    }

    function getQueueAsPlainText() {
        var date = new Date();
        var timestamp = String(date.getTime()).substr(0, 10);
        var text = '';
        var name;

        for(name in queue) {
            text += name +' '+ queue[name].value +' '+ timestamp +'\n';
        }
        if (text) {
            logger.log('Sending: ' + text);
        }
        return text;
    }

    function send(callback) {
        var metrics = new Buffer(getQueueAsPlainText());

        if(Object.keys(queue).length === 0) {
            logger.log('Queue is empty. Nothing to send');
            return;
        }
        logger.log('Sending '+ Object.keys(queue).length +' metrics to '+ options.host +':'+ options.port);
        socket.send(metrics, 0, metrics.length, options.port, options.host, function(err, bytes) {
            if (callback) {
                callback(err, bytes);
            }
            if(err) {
                logger.error('Error sending metrics: '+ err);
            }
        });
        queue = {};
        tid = 0;
    }
    return init();
}

module.exports = function(options) {
    options = options || {};

    if (config.enabled) {
        client = client || new Client(options);
    }
    else {
        client = {
            send: function() {}
        };
    }
    return client;
};
