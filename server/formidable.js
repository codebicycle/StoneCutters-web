var config = require('../config');
var formidable = require('formidable');
var os = require('os');

module.exports = function(req, options, callback) {
    var form = new formidable.IncomingForm();
    var error;
    var aborted;

    if (options instanceof Function) {
        callback = options;
        options = {};
    }
    if (!(callback instanceof Function)) {
        callback = null;
    }
    if (options.field && options.field instanceof Function) {
        form.on('field', options.field);
    }
    if (options.fileBegin && options.fileBegin instanceof Function) {
        form.on('fileBegin', options.fileBegin);
    }
    if (options.file && options.file instanceof Function) {
        form.on('file', options.file);
    }
    if (options.progress && options.progress instanceof Function) {
        form.on('progress', options.progress);
    }
    if (options.error && options.error instanceof Function) {
        error = options.error;
    }
    else {
        error = callback;
    }
    if (error) {
        form.on('error', error);
    }
    if (options.aborted && options.aborted instanceof Function) {
        aborted = options.aborted;
        form.on('aborted', aborted);
    }
    else if (error) {
        aborted = function() {
            error('aborted');
        };
    }
    if (aborted) {
        form.on('aborted', aborted);
    }
    if (options.end && options.end instanceof Function) {
        form.on('end', end);
    }
    form.uploadDir = options.uploadDir || config.get(['formidable', 'uploadDir'], os.tmpDir());
    form.keepExtensions = options.keepExtensions || config.get(['formidable', 'keepExtensions'], true);
    form.multiples = options.multiples || config.get(['formidable', 'multiples'], true);
    form.onPart = function(part) {
        if (!part.mime || part.filename) {
            form.handlePart(part);
        }
    };
    if (callback) {
        form.parse(req, callback);
    }
    else {
        form.parse(req);
    }
};
