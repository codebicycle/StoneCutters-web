'use strict';

var _ = require('underscore');
var common = require('./common');
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
        var aux = data.url.split('/');
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
        _.each(params, function each(index, value) {
            if(index !== ''){
                url = url + '-';
                if (Array.isArray(value)) {
                    if (parseInt(index[0]) <= parseInt(index[1])) {
                        param = value + '_' + index[0] + '_' + index[1];
                    } else {
                        param = value + '_' + index[1] + '_' +index[0];
                    }
                }else{
                    param = value + '_' + index;
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