'use strict';

var _ = require('underscore');
var dateformat = require('dateformat');
var helpers = require('../../helpers');

module.exports = function(nunjucks) {

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

                    if (page == 1)
                        regExp = new RegExp('/-p-([0-9]+)', 'g');

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

    function link(href, query) {
        href = helpers.common.fullizeUrl(href, this.ctx.app);
        return helpers.common.link(href, this.ctx.app, query || {});
    }

    function linkig(href, query) {
        if (this.ctx.nav && this.ctx.nav.galeryAct) {
            href = helpers.common.linkig.call(this.ctx, href, query, this.ctx.nav.current);
        }
        return helpers.common.fullizeUrl(href, this.ctx.app);
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

    function log() {
        console.log.apply(console, arguments);
    }

    function is(value, type) {
        var fn = _[['is', type.charAt(0).toUpperCase(), type.slice(1)].join('')];

        if (fn) {
            return fn.call(_, value);
        }
        return typeof value === type;
    }

    function statics() {
        return helpers.common.static.apply(this.ctx, arguments);
    }

    return {
        is: is,
        log: log,
        date: date,
        link: link,
        linkig: linkig,
        encode: encode,
        'static': statics,
        pagination: paginations,
        countFormat: countFormat,
        slugToUrl: helpers.common.slugToUrl
    };
};
