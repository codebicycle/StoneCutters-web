'use strict';

module.exports = function(params, next) {
    var href;
    var location;

    if (this.app.session.get('isServer')) {
        href = this.app.session.get('protocol') + '://' + this.app.session.get('siteLocation') + this.app.session.get('path');

        this.app.session.update({
            href: href
        });
    }
    else {
        location = window.location;
        href = this.app.session.get('protocol') + '://' + this.app.session.get('siteLocation') + location.pathname;

        this.app.session.update({
            path: location.pathname,
            url: location.href,
            href: href
        });
    }
    next();
};
