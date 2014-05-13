'use strict';

var _ = require('underscore');
var head = {
    title: 'OLX Mobile',
    metatags: {}
};

module.exports = {
    getHead: function() {
        var clone = _.clone(head);

        clone.metatags = Object.keys(clone.metatags).map(function each(metatag) {
            return {
                name: metatag,
                content: clone.metatags[metatag]
            };
        });
        console.log(clone.metatags);
        return clone;
    },
    resetHead: function() {
        head.title = 'OLX Mobile';
        head.metatags = {};
    },
    addMetatag: function(name, content) {
        if (name === 'title') {
            head.title = content;
            return;
        }
        console.log(name);
        head.metatags[name] = content;
    }
};
