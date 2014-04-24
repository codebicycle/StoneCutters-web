'use strict';

var _ = require('underscore');
var head = {
    title: 'OLX Mobile',
    metatags: []
};

module.exports = {
    getHead: function() {
        return _.clone(head);
    },
    resetHead: function() {
        head.title = 'OLX Mobile';
        head.metatags = [];
    },
    addMetatag: function(name, content) {
        if (name === 'title') {
            head.title = content;
            return;
        }
        head.metatags.push({
            name: name,
            content: content
        });
    }
};
