'use strict';

var config = require('../config');
var _ = require('underscore');

module.exports = function(nunjucks) {
    return {
        json: function(json) {
            return JSON.stringify(json);
        },
        static: function(path, key, value) {
            var env = config.get(['environment', 'type'], 'development');
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

                    if (env !== 'development') {
                        var pointIndex = path.lastIndexOf('.');
                        var ext = path.substr(pointIndex + 1);
                        var fileName = path.substr(0, pointIndex);
                        var revision = config.get(['deploy', 'revision'], '0');

                        filePath = (fileName + '-' + revision + '.' + ext);
                        if (ext === 'css') {
                            filePath = (fileName + '-' + env + '-' + revision + '.' + ext);
                        }
                    }
                    var envPath = config.get(['environment', 'staticPath'], '');

                    if (env === 'production') {
                        return envPath.replace(/\[\[basenumber\]\]/, baseNumber) + filePath;
                    }
                    return envPath + filePath;
                },
                image: function(filePath) {
                    var envPath = config.get(['environment', 'imagePath'], '');

                    if (env === 'production') {
                        var baseNumber = '0' + ((filePath.length() % 4) + 1);
                        return envPath.replace(/\[\[basenumber\]\]/, baseNumber) + filePath;
                    }
                    return envPath + filePath;
                }
            };

            if (key && value) {
                path = path.replace(key, value);
            }
            type = getType(path);
            if (!type) {
                return path;
            }
            return typesHandler[type](path);
        },
        filter: function(filter, currentURL) {
            var out = [];
            var current;
            var name = '-' + filter.name + '_';
            var regExp = new RegExp(name + '-p-([0-9]+)', 'g');

            currentURL = currentURL.replace(regExp, '-p-1');

            function prepareURL(value, description) {
                out.push('<a href="');
                if (!~currentURL.indexOf(name)) {
                    out.push(currentURL + name + value);
                } else {
                    regExp = new RegExp(name + '([a-zA-Z0-9_]*)', 'g');
                    out.push(currentURL.replace(regExp, name + value));
                }
                out.push('">' + description + '</a>');
            }

            out.push('<div id="filter-' + filter.name + '">');
            switch(filter.type) {
                case 'SELECT':
                    out.push('<h4>' + filter.description + '</h4>');
                    out.push('<ul class="list-group">');
                    _.each(filter.value, function outputSelectFilter(item) {
                        out.push('<li class="list-group-item">');
                        prepareURL(item.id, item.value);
                        out.push('</li>');
                    });
                    out.push('</ul>');
                    break;
                case 'BOOLEAN':
                    out.push('<div class="checkbox">');
                    out.push(' <label for="filter-check-' + filter.name + '">');
                    prepareURL(true, '<input id="filter-check-' + filter.name + '" type="checkbox"> ' + filter.description);
                    out.push(' </label>');
                    out.push('</div>');
                    break;
                case 'RANGE':
                    out.push('<h4>' + filter.description + '</h4>');
                    out.push('<form action="/nf/search/redirect" method="post" class="form-inline" role="form">');
                    _.each(filter.value, function outputRangeFilter(item) {
                        out.push('<input type="text" class="form-control" name="' + item.id + '_' + filter.name +'" placeholder="' + item.value + '" size="5">');
                    });
                    out.push('  <input type="hidden" class="hide" name="currentURL" value="' + currentURL + '">');
                    out.push('  <input type="hidden" class="hide" name="name" value="' + filter.name + '">');
                    out.push('  <button type="submit" class="btn btn-default">&gt;</button>');
                    out.push(' </form>');
                    out.push('</div>');
                    break;
                default:
                    break;
            }
            out.push('</div>');
            return out.join('');
        }
    };
};
