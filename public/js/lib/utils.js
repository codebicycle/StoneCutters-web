
// TimerExec - Timer executor
// -----------------------------------------------------------------------------
(function(root, factory) {

    if (typeof define === 'function' && define.amd) {
        define(['underscore', 'exports'], function(_, exports) {
            root.TimerExec = factory(root, exports, _);
        });
    }
    else if (typeof exports !== 'undefined') {
        var _ = require('underscore');
        factory(root, exports, _);
    }
    else {
        root.TimerExec = factory(root, {}, root._);
    }

}(window, function(root, TimerExec, _) {

    var defaults = {
        frequency: 1000,
        autostart: true
    };

    function TimerExec(callback, options) {
        this.callback = callback;
        this.options = _.defaults({}, options, defaults);
        this.running = false;
        this.timeStart = new Date().getTime();

        if (this.options.autostart) {
            this.start();
        }
    };

    _.extend(TimerExec.prototype, {
        start: function() {
            if (!this.timer) {
                this.timer = setInterval(this.run.bind(this), this.options.frequency);
            }
        },
        stop: function() {
            if (!this.timer) {
                return;
            }
            clearInterval(this.timer);
            this.timer = null;
        },
        run: function() {
            if (!this.running) {
                try {
                    this.running = true;
                    this.callback(this);
                    this.running = false;
                } catch(e) {
                    this.running = false;
                    throw e;
                }
            }
        },
        time: function() {
            return (new Date().getTime() - this.timeStart);
        }
    });

    root.TimerExec = TimerExec;

    return TimerExec;
}));


// Async - Asynchronous executor
// -----------------------------------------------------------------------------
(function(root, factory) {

    if (typeof define === 'function' && define.amd) {
        define(['underscore', 'exports'], function(_, exports) {
            root.asyncApi = factory(root, exports, _);
        });
    }
    else if (typeof exports !== 'undefined') {
        var _ = require('underscore');
        factory(root, exports, _);
    }
    else {
        root.asyncApi = factory(root, {}, root._);
    }

}(window, function(root, asyncApi, _) {

    var previousAsyncApi = root.asyncApi;
    var defaults = {
        wait: false,
        frequency: 1000,
        timeout: 5000,
        executed: false
    };

    _.extend(asyncApi, {
        /*
            obj - Function | Object

            if typeof obj === Object then
            {
                callback: Function,
                wait?: Function (Return boolean) - Default: false,
                frequency?: Number (Miliseconds) - Default: 1000,
                timeout?: Number (Miliseconds) - Default: 5000
            }            
        */
        push: function(obj) {
            var options;

            if (!obj) {
                return;
            }
            if (_.isFunction(obj)) {
                return obj();
            }
            if (_.isObject(obj)) {
                options = _.defaults({}, obj, defaults);

                new TimerExec(function callback(te) {
                    if (options.executed || options.timeout <= te.time()) {
                        return te.stop();
                    }
                    if (!options.wait || (_.isFunction(options.wait) && options.wait())) {
                        options.executed = true;
                        options.callback();
                        return te.stop();
                    }
                }, {
                    frequency: options.frequency
                });
            }
        }
    });

    if (previousAsyncApi && Array.isArray(previousAsyncApi)) {
        _.each(previousAsyncApi, asyncApi.push);
    }

    root.asyncApi = asyncApi;

    return asyncApi;
}));