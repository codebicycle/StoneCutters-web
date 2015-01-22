'use strict';

var Base = require('./show');

var ShowIg = Base.extend({
    redirection: redirection
});

function redirection(done) {
    var platform = this.app.session.get('platform');

    if (platform !== 'desktop' && platform !== 'html5') {
        done.abort();
        return this.error();
    }
    this.get('params')['f.hasimage'] = true;
    Base.prototype.redirection.call(this, done);
}

module.exports = ShowIg;
