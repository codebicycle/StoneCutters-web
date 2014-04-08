'use strict';

var config = require('../config');
var _ = require('underscore');

module.exports = function(Handlebars) {
    return {
        layout: function(template, path, options) {
            this.layout = template + path;
            return options.fn(this);
        },
        getFieldTemplate: function(template, options) {
            this.fieldPath = template + "/fields/" + this.fieldType;
            return options.fn(this);
        },
        parseOptionalFieldName: function(fieldName, options) {
            if (fieldName.indexOf('opt.') !== 0) {
                return fieldName;
            }
            return 'opts['+fieldName+']';
        },
        html: function(string, options) {
            return new Handlebars.SafeString(string);
        },
        static: function(path) {
            var env = config.get(['environment', 'type'], 't');
            var type;
            var revision;
            var handler;
            function getType(path) {
                var ext = path.substr(path.lastIndexOf('.') + 1);
                var accept = config.get(['environment', 'static', 'accept'], ['css', 'js']);
                if (_.indexOf(accept, ext) >= 0) {
                    return 'static';
                }
                accept = config.get(['environment', 'image', 'accept'], ['jpg', 'jpeg', 'png', 'gif', 'ico']);
                if (_.indexOf(accept, ext) >= 0) {
                    return 'image';
                }
            }

            var typesHandler = {
                static: function(path) {
                    console.log('··························· static ···························');
                    
                    return path;
                },
                image: function(path) {
                    console.log('··························· image ···························');
                    var path = config.get(['environment', 'static', 'accept'], ['css', 'js']);
                    return path;
                }
            };

            type = getType(path);
            if (!type) {
                return path;
            }
            return typesHandler[type](path);
        }
    };
};
