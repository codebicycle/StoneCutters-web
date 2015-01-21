'use strict';

var Base = require('./show');

var ShowIg = Base.extend({
    redirection: redirection
});

function redirection(done) {
    if (this.app.session.get('platform') !== 'desktop') {
        done.abort();
        return this.error();
    }
    this.get('params')['f.hasimage'] = true;
    Base.prototype.redirection.call(this, done);
}

module.exports = ShowIg;
