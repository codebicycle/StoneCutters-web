'use strict';

var _ = require('underscore');
var dateformat = require('dateformat');
var helpers = require('../../helpers');

module.exports = function(nunjucks) {

    function link(href, query) {
        href = helpers.common.fullizeUrl(href, this.ctx.app);
        return helpers.common.link(href, this.ctx.app, query || {});
    }

    function linkig(href, query) {
        if (this.ctx.nav && this.ctx.nav.galeryAct) {
            href = helpers.common.linkig.call(this.ctx, href, query, this.ctx.nav.current);
        }
        else {
            href = link.call(this, href, query);
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
        countFormat: countFormat,
        slugToUrl: helpers.common.slugToUrl
    };
};
