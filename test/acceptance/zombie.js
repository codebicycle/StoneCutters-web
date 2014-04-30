'use strict';

module.exports = function() {
    var Browser = require('zombie');


    Browser.dns.localhost('m.olx.com.ar');
    Browser.dns.localhost('m.olx.com.br');
    Browser.dns.localhost('m.olx.com.co');
    Browser.dns.localhost('m.olx.com.fr');
    Browser.ports.map('m.olx.com.ar', 3030);
    Browser.ports.map('m.olx.com.br', 3030);
    Browser.ports.map('m.olx.com.co', 3030);
    Browser.ports.map('m.olx.com.fr', 3030);
    Browser.ports.map('localhost', 3030);
    return Browser;
};
