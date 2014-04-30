'use strict';

var config = require('../../server/config');
var environment = config.get('environment', 'development');
var zombie = config.get('zombie', {
    dns: {
        localhost: true,
        ip: '127.0.0.1',
        port: 3030,
        hosts: []
    }
});

module.exports = function() {
    var Browser = require('zombie');

    zombie.dns.hosts.forEach(function each(host) {
        host = host.replace('m.', 'm2.');
        if (zombie.dns.localhost) {
            Browser.dns.localhost(host);
        }
        else {
            Browser.dns.map(host, 'A', zombie.dns.ip);
            if (zombie.dns.port) {
                console.log(zombie.dns.port);
                Browser.ports.map(host, zombie.dns.port);
            }
        }
    });
    if (zombie.dns.localhost && zombie.dns.port) {
        Browser.ports.map('localhost', zombie.dns.port);
    }
    return Browser;
};
