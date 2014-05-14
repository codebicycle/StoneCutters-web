'use strict';

var _ = require('underscore');
var head = {
    title: 'OLX Mobile',
    canonical: '',
    metatags: {}
};

function checkSpecials(name, content) {
    if (name === 'title' || name === 'canonical') {
        head[name] = content;
        return true;
    }
    return false;
}

module.exports = {
    getHead: function() {
        var clone = _.clone(head);

        clone.metatags = Object.keys(clone.metatags).map(function each(metatag) {
            return {
                name: metatag,
                content: clone.metatags[metatag]
            };
        });
        return clone;
    },
    resetHead: function() {
        head.title = 'OLX Mobile';
        head.canonical = '';
        head.metatags = {};
    },
    addMetatag: function(name, content) {
        if (checkSpecials(name, content)) {
            return;
        }
        head.metatags[name] = content;
    }
};
