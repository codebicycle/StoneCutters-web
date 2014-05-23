'use strict';

var config = require('../../config');
var common = require('../common');
var controllers = require('../controllers');
var _ = require('underscore');
var dateformat = require('dateformat');

module.exports = function(nunjucks) {
    return {
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
                        var revision = config.get(['deploy', 'deploy', 'revision'], '0');

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
        },
        pagination: function(metadata, platform) {
            var that = this;
            var out = [];
            var currentPage = metadata.page;
            var currentURL = metadata.current;
            var pages = metadata.totalPages;
            var regExp = new RegExp('-p-([0-9]+)', 'g');
            var pagination = [currentPage-2, currentPage-1, currentPage, currentPage+1, currentPage+2];
            var count = 0;
            var max;
            var i;

            function prepareStyle(last, start, end) {
                if (platform !== 'wap') {
                    out.push(start || '" ');
                    out.push('class="');
                    out.push(last ? 'last' : '');
                    out.push(end || '');
                }
            }

            function prepareSeparator(last) {
                if (platform === 'wap') {
                    out.push(last ? '' : ' | ');
                }
            }

            function prepareURL(page, last) {
                if (page > 0 && page <= pages) {
                    if(page === currentPage){
                        out.push('<strong');
                        prepareStyle(last, ' ', '"');
                        out.push('>');
                        out.push(page);
                        out.push('</strong>');
                        prepareSeparator(last);
                    }
                    else {
                        out.push('<a href="');
                        out.push(common.link(currentURL.replace(regExp, '-p-' + page), that.ctx.siteLocation));
                        prepareStyle(last);
                        out.push('">');
                        out.push(page);
                        out.push('</a>');
                        prepareSeparator(last);
                    }
                    count++;
                }
                else if (page < pages) {
                    pagination.push(pagination[pagination.length - 1] + 1);
                }
            }

            if ((pages - currentPage) < 2) {
                max = (pages - currentPage);
                for (i = 0, max = (max === 0 ? 2 : max); i < max; i++) {
                    pagination.splice(0, 0, pagination[0] - 1);
                    pagination.pop();
                }
            }
            max = 5;
            for (i = 0; i < pagination.length && count < max; i++) {
                prepareURL(pagination[i], ((count + 1) === max));
            }

            return out.join('');
        },
        is: function(value, type) {
            return typeof value === type;
        },
        link: function (href) {
            return common.link(href, this.ctx.siteLocation);
        },
        date: function(timestamp) {
            return dateformat(new Date(timestamp), 'dd-mm-yyyy');
        },
        breadcrumb: function(referer) {
            var breadcrumb = referer;
            var currentRoute = this.ctx.currentRoute;

            if (currentRoute.controller === 'items') {
                if (currentRoute.action === 'index') {
                    var categoryId = this.ctx.category.parentId;
                    var category = this.ctx._app.getSession('categories')._byId[categoryId];
                    
                    breadcrumb = '/' + common.slugToUrl(category);
                }
            }
            return breadcrumb || '/';
        },
        slugToUrl: common.slugToUrl,
        urlize: common.urlize
    };
};
