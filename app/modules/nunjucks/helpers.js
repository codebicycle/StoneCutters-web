'use strict';

var _ = require('underscore');
var dateformat = require('dateformat');
var helpers = require('../../helpers');

module.exports = function(nunjucks) {
    function log() {
        console.log.apply(console, arguments);
    }

    function encode(text) {
        return encodeURIComponent(text);
    }

    function date(timestamp, complete) {
        complete = complete || false;
        var completeDate;
        var month;
        if (complete === true) {
            month = timestamp.split('-')[1];
            month = this.ctx.dictionary['messages_date_format.1' + month];
            completeDate = dateformat(new Date(timestamp), 'dd, h:MM:ss TT');
            completeDate = month + ' ' + completeDate;
            return completeDate;
        } else {
            return dateformat(new Date(timestamp), 'dd/mm/yyyy');
        }
    }

    function countFormat(count) {
        return count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    function is(value, type) {
        var fn = _[['is', type.charAt(0).toUpperCase(), type.slice(1)].join('')];

        if (fn) {
            return fn.call(_, value);
        }
        return typeof value === type;
    }

    function link(href, query) {
        href = helpers.common.fullizeUrl(href, this.ctx.app);
        return helpers.common.link(href, this.ctx.app, query || {});
    }

    function linkig(href, query) {
        var regexpFindPage = /-p-[0-9]+/;
        var regexpReplacePage = /(-p-[0-9]+)/;
        var regexpFindCategory = /[a-zA-Z0-9-]+-cat-[0-9]+/;
        var regexpReplaceCategory = /([a-zA-Z0-9-]+-cat-[0-9]+)/;
        var querystring;
        var pairs;
        var path;

        if (this.ctx.nav && this.ctx.nav.galeryAct) {
            pairs = href.split('?');
            path = pairs[0];
            querystring = pairs[1];

            if (!~path.indexOf('-ig')) {
                if (this.ctx.nav.current === 'searchig') {
                    if (path.match(regexpFindPage)) {
                        path = path.match(regexpReplacePage, '$1-ig');
                    }
                    else if (path.match(regexpFindCategory)) {
                        path = path.match(regexpReplaceCategory, '$1-ig');
                    }
                    else if (path.slice(path.length - 1) !== '/') {
                        path += '/';
                    }
                    path += '-ig';
                }
                else if (this.ctx.nav.current === 'allresultig') {
                    if (path.match(regexpFindPage)) {
                        path = path.match(regexpReplacePage, '-ig$1');
                    }
                    else if (path.slice(path.length - 1) === '/') {
                        path = path.substring(0, path.length - 1);
                    }
                    path += '-ig';
                }
                else if (this.ctx.nav.current === 'showig') {
                    if (path.match(regexpFindPage)) {
                        path = path.match(regexpReplacePage, '$1-ig');
                    }
                    else if (path.slice(path.length - 1) === '/') {
                        path = path.substring(0, path.length - 1);
                    }
                    path += '-ig';
                }
            }

            href = path;
            if (querystring) {
                href = '?' + querystring;
            }
        }
        return link.call(this, href, query);
    }

    function linkFilter(filter, metadata, query) {
        var name = '-' + filter.name + '_';
        var regExp = new RegExp(name + '-p-([0-9]+)', 'g');
        var current = metadata.current.replace(regExp, '-p-1');
        var href = current + name + true;

        if (~current.indexOf(name)) {
            regExp = new RegExp(name + '([a-zA-Z0-9_]*)', 'g');
            href = current.replace(regExp, name + true);
        }
        return link.call(this, href, query);
    }

    function filters(filter, currentURL) {
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
                out.push('<form action="/nf/filter/redirect" method="post" class="form-inline" role="form">');
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

    function paginations(metadata, platform) {
        var context = this.ctx;
        var out = [];
        var url = metadata.current;
        var page = metadata.page;
        var pages = metadata.totalPages;
        var regExp = new RegExp('-p-([0-9]+)', 'g');
        var pagination = [page-2, page-1, page, page+1, page+2];
        var prepareCallback = prepareURL;
        var count = 0;
        var length;
        var max;
        var i;

        if (platform === 'html5') {
            pagination = [page-3, page-2, page-1, page, page+1, page+2, page+3];
        }
        if (platform === 'desktop') {
            pagination = [page-5, page-4, page-3, page-2, page-1, page, page+1, page+2, page+3, page+4];
        }
        length = pagination.length;


        function prepareStyle(isLast, start, end) {
            if (platform !== 'wap') {
                out.push(start || '" ');
                out.push('class="');
                out.push(isLast ? 'last' : '');
                out.push(end || '');
            }
        }

        function prepareSeparator(isLast) {
            if (platform === 'wap' && !isLast) {
                out.push(' | ');
           }
        }

        function prepareURL(_page, isLast) {
            if (_page > 0 && _page <= pages) {
                if (_page === page) {
                    out.push('<strong');
                    prepareStyle(isLast, ' ', '"');
                    out.push('>');
                    out.push(_page);
                    out.push('</strong>');
                }
                else {
                    var replace = '';

                    out.push('<a href="');
                    if (_page > 1) {
                        replace = '-p-' + _page;
                    }
                    out.push(helpers.common.link(url.replace(regExp, replace), context.app));
                    prepareStyle(isLast);
                    out.push('">');
                    out.push(_page);
                    out.push('</a>');
                }
                prepareSeparator(isLast);
                count++;
            }
            else if (_page < pages) {
                pagination.push(pagination[pagination.length - 1] + 1);
            }
        }

        function prepareDesktopURL(_page, isLast) {
            if (_page > 0 && _page <= pages) {
                if (_page === page) {
                    out.push('<li class="current">');
                    out.push(_page);
                    out.push('</li>');
                }
                else {
                    var replace = '';
                    out.push('<li>');
                    out.push('<a href="');
                    if (_page > 1) {
                        replace = '-p-' + _page;
                    }
                    out.push(helpers.common.link(url.replace(regExp, replace), context.app));
                    out.push('" class="pagination-number" >');
                    out.push(_page);
                    out.push('</a>');
                    out.push('</li>');
                }
                prepareSeparator(isLast);
                count++;
            }
            else if (_page < pages) {
                pagination.push(pagination[pagination.length - 1] + 1);
            }
        }

        if (!url.match(regExp)) {
            url += '-p-0';
        }
        if ((pages - page) < 2) {
            max = (pages - page);
            for (i = 0, max = (max === 0 ? 2 : max); i < max; i++) {
                pagination.splice(0, 0, pagination[0] - 1);
                pagination.pop();
            }
        }
        if (platform === 'desktop') {
            prepareCallback = prepareDesktopURL;
        }

        max = length;
        for (i = 0; i < pagination.length && count < max; i++) {
            prepareCallback(pagination[i], ((count + 1) === max));
        }
        return out.join('');
    }

    return {
        log: log,
        encode: encode,
        date: date,
        countFormat: countFormat,
        is: is,
        link: link,
        linkig: linkig,
        linkFilter: linkFilter,
        filter: filters,
        pagination: paginations,
        static: function() {
            return helpers.common.static.apply(this.ctx, arguments);
        },
        slugToUrl: helpers.common.slugToUrl
    };
};
