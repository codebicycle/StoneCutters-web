'use strict';

var _ = require('underscore');
var common = require('./common');
var navigation = require('./navigation');
module.exports = (function() {

    function prepare(metadata) {
        var filters = metadata.filters;
        var obj = {};

        _.each(filters, function each(filter) {
            obj[filter.name] = filter;
        });
        metadata.filters = obj;
    }


    function generateFilterOrder(fields, data, action) {
        var aux = data.split('/');
        var urllocal = '';
        var url = '';
        var filtergenerate = '';
        var param = '';
        var params = common.serializeFormJSON(fields);
        var baseUrl = '';

        aux.pop();
        urllocal = aux.join('/');

        if (action == 'sort') {
            filtergenerate = verifyActualSort(urllocal);
        } else {
            filtergenerate = verifyActualFilter(urllocal);
        }

        $.each(params, function (index, value) {
            if(value !== ''){
                url = url + '-';
                if (Array.isArray(value)) {
                    if (parseInt(value[0]) <= parseInt(value[1])) {
                        param = index + '_' + value[0] + '_' + value[1];
                    } else {
                        param = index + '_' + value[1] + '_' +value[0];
                    }
                }else{
                    param = index + '_' + value;
                }
                url = url + '' + param;
            }
        });

        if (filtergenerate !== '') {
            filtergenerate = '-' + filtergenerate;
        }

        if (action == 'sort') {
            url = filtergenerate + '' + url;
        } else {
            url = url + '' + filtergenerate;
        }

        baseUrl = urllocal.split('/');
        if (baseUrl[baseUrl.length-1][0] === '-') {
            baseUrl.pop();
            urllocal = baseUrl.join('/');
        }

        return urllocal + '/' + url;
    }

    function verifyActualSort(url) {
        var aux = url.split('/');
        var auxtwo = '';

        if(aux.length > 4){
            auxtwo = aux[aux.length-1].split('-');
            if (/^sort_+.*/.test(auxtwo[auxtwo.length-1])) {
                auxtwo.shift();
                auxtwo.pop();
            } else {
                auxtwo.shift();
            }
            auxtwo = auxtwo.join('-');
        }

        return auxtwo;
    }

    function verifyActualFilter(url) {
        var aux = url.split('/');
        var result='';

        if (aux.length > 4) {
            var filter = aux[aux.length-1].split('-');
            for (var i = 0; i < filter.length; i++) {
                if (/^sort_+.*/.test(filter[i])) {
                   result = filter[i];
                   break;
                }
            }
        }

        return result;
    }

    return {
        prepare: prepare,
        generateFilterOrder: generateFilterOrder
    };
})();