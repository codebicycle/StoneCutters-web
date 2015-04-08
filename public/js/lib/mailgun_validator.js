//
// Mailgun Address Validation Plugin
//
// Attaching to a form:
//
//    $('jquery_selector').mailgun_validator({
//        api_key: 'api-key',
//        in_progress: in_progress_callback, // called when request is made to validator
//        success: success_callback,         // called when validator has returned
//        error: validation_error,           // called when an error reaching the validator has occured
//    });
//
//
// Sample JSON in success callback:
//
//  {
//      "is_valid": true,
//      "parts": {
//          "local_part": "john.smith@example.com",
//          "domain": "example.com",
//          "display_name": ""
//      },
//      "address": "john.smith@example.com",
//      "did_you_mean": null
//  }
//
// More API details: https://api.mailgun.net/v2/address
//

var _ = require('underscore');

$.fn.mailgun_validator = function(options) {
    return this.each(function() {
        run_validator($(this).val(), options);
    });
};


function run_validator(address, options) {
    var ctx = {
        address: address,
        options: options || {},
        success: false
    };

    if (!check(ctx)) {
        return;
    }
    $.ajax(prepare(ctx));
}

function check(ctx) {
    var message;

    if (!ctx.address) {
        return false;
    }
    if (ctx.address.length > 512) {
        message = 'Stream exceeds maxiumum allowable length of 512.';
        if (ctx.options && ctx.options.error) {
            ctx.options.error(message);
        }
        else {
            console.log(message);
        }
        return false;
    }
    if (ctx.options.in_progress) {
        ctx.options.in_progress();
    }
    if (ctx.options.api_key == undefined) {
        console.log('Please pass in api_key to mailgun_validator.');
    }
    return true;
}

function prepare(ctx) {
    var options = _.defaults({}, ctx.options, {
        type: 'GET',
        url: 'https://api.mailgun.net/v2/address/validate?callback=?',
        data: {
            address: ctx.address,
            api_key: ctx.options.api_key
        },
        dataType: 'jsonp',
        crossDomain: true,
        success: success,
        error: error,
        timeout: 3000
    });

    function success(data, status) {
        ctx.success = true;
        if (ctx.options.success) {
            ctx.options.success(data);
        }
    }

    function error(request, status, error) {
        var message = 'Error occurred, unable to validate address.';

        ctx.success = true;
        if (ctx.options.error) {
            ctx.options.error(message);
        }
        else {
            console.log(message);
        }
    }

    return options;
}
