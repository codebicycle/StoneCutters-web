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
            var handler;
            function getType(path) {
                var ext = path.substr(path.lastIndexOf('.') + 1);
                var defaults = ['css', 'js'];
                var accept = config.get('staticAccept', defaults);
                if (_.indexOf(accept, ext) >= 0) {
                    return 'static';
                }

                defaults = ['jpg', 'jpeg', 'png', 'gif', 'ico'];
                accept = config.get('imageAccept', defaults);
                if (_.indexOf(accept, ext) >= 0) {
                    return 'image';
                }
            }

            var typesHandler = {
                static: function(filePath) {
                    var baseNumber = '0' + ((filePath.length % 4) + 1);
                    if (env !== 'd') {
                        var pointIndex = path.lastIndexOf('.');
                        var ext = path.substr(pointIndex + 1);
                        var fileName = path.substr(0, pointIndex);
                        var revision = config.get('revision', '0');
                        filePath = (fileName + '-' + revision + '.' + ext);
                    }
                    var envPath = config.get(['environment', 'staticPath'], '');

                    if (env === 'p') {
                        return envPath.replace(/\[\[basenumber\]\]/, baseNumber) + filePath;
                    }
                    return envPath + filePath;
                },
                image: function(filePath) {
                    var envPath = config.get(['environment', 'imagePath'], '');
                    if (env === 'p') {
                        var baseNumber = '0' + ((filePath.length() % 4) + 1);
                        return envPath.replace(/\[\[basenumber\]\]/, baseNumber) + filePath;
                    }
                    return envPath + filePath;
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
