'use strict';

function CrossDomainStorage(origin, path) {
	this.origin = origin;
	this.path = path;
	this._iframe = null;
	this._iframeReady = false;
	this._queue = [];
	this._requests = {};
	this._id = 0;
    this.init();
}

CrossDomainStorage.prototype = {
    constructor: CrossDomainStorage,
    //public interface methods
    init: function() {
        var that = this;
        var loadCross;

        loadCross = function() {
            var doc = document;
            var win = window;
            
            if (!that._iframe) {
                that._iframe = doc.createElement("iframe");
                that._iframe.style.cssText = "position:absolute;width:1px;height:1px;display:none;";
                doc.body.appendChild(that._iframe);
                if (win.addEventListener) {
                    that._iframe.addEventListener("load", function(){ that._iframeLoaded(); }, false);
                    win.addEventListener("message", function(event){ that._handleMessage(event); }, false);
                }
                else if (that._iframe.attachEvent) {
                    that._iframe.attachEvent("onload", function(){ that._iframeLoaded(); }, false);
                    win.attachEvent("onmessage", function(event){ that._handleMessage(event); });
                }
            }
            that._iframe.src = that.origin + that.path;
        };

        if (window.addEventListener) {
            window.addEventListener('load', loadCross, false);
        }
        else if (window.attachEvent) {
            window.attachEvent('onload', loadCross);
        }
    },
    makeRequest: function(data, callback) {
        var request = {
            request: {
                id: ++this._id,
                data: data
            },
            callback: callback
        };

        if (this._iframeReady){
            this._sendRequest(request);
        }
        else {
            this._queue.push(request);
        }
    },
    //private methods
    _sendRequest: function(data) {
        this._requests[data.request.id] = data;
        this._iframe.contentWindow.postMessage(JSON.stringify(data.request), this.origin);
    },
    _iframeLoaded: function() {
        this._iframeReady = true;
        if (this._queue.length){
            for (var i=0, len=this._queue.length; i < len; i++){
                this._sendRequest(this._queue[i]);
            }
            this._queue = [];
        }
    },
    _handleMessage: function(event) {
        if (event.origin == this.origin){
            var eventData = JSON.parse(event.data);
            this._requests[eventData.id].callback(eventData.response);
            delete this._requests[eventData.id];
        }
    }
};

window.LocalCache = {
    remoteStorage: null,
    hasStorage: window.postMessage && window.localStorage,
    init: function() {
        if (this.hasStorage) {
            this.remoteStorage = new CrossDomainStorage(this.getBaseDomain(), "/localstorageiframe.php");
        }
    },
    getBaseDomain: function() {
        var url = window.location.host.toString();
        return ['http://www.', url.substring(url.indexOf('.') + 1, url.length)].join('').replace('.m.', '.');
    },
    multiget: function(keyPrefix, dataList, callback) {
        var deferred = jQuery.Deferred();
        var self = this;

        this.getmany(keyPrefix, dataList).done( function(ans) {
            if (typeof callback == "function") {
                var cached = {};
                var idsToRetrieve = [];

                for (var i = 0; i < dataList.length; i++) {
                    if (dataList[i] in ans) {
                        cached[dataList[i]] = ans[dataList[i]];
                    }
                    else {
                        idsToRetrieve.push(dataList[i]);
                    }
                }
                if (idsToRetrieve.length > 0) {
                    callback(idsToRetrieve).done(function(datosTemp) {
                        self.setmany(keyPrefix, datosTemp).done( function() {
                            for (var key in datosTemp) {
                                cached[key] = datosTemp[key];
                            }
                            deferred.resolve(cached);
                        });
                    });
                }
                else {
                    deferred.resolve(cached);
                }
            }
            else {
                deferred.resolve(ans);
            }
        });
        return deferred.promise();
    },
    buildKey: function(keyPrefix, data) {
        return (keyPrefix) ? keyPrefix.concat("-", data) : data;
    },
    getExpirationTime: function(keyPrefix) {
        var expirations = {
            //day * hours * minuts * seconds * 1000
            '*': 1 * 1 * 60 * 60 * 1000   //1 hour
            ,'form.cache': 1 * 24 * 60 * 60 * 1000   //1 day
        }
        if (!(keyPrefix in expirations)) {
            keyPrefix = "*";
        }
        return expirations[keyPrefix];
    },
    getAll: function() {
        var deferred = jQuery.Deferred();

        this.remoteStorage.makeRequest({action:'getAll'}, function(response) {
            deferred.resolve(response);
        });
        return deferred.promise();
    },
    get: function(keyPrefix, key) {
        var deferred = jQuery.Deferred();
        
        this.getmany(keyPrefix, [key]).done(function(ans){
            deferred.resolve( ans[key] );
        });
        return deferred.promise();
    },
    getmany: function(keyPrefix, keys) {
        var deferred = jQuery.Deferred();

        if (!this.hasStorage) {
            deferred.resolve({});
        }
        else {
            var keysEncoded = {};
            
            for (var i = 0; i < keys.length; i++) {
                keysEncoded[ String( keys[i] )] =  this.buildKey(keyPrefix, keys[i]);
            }

            var self = this;

            this.remoteStorage.makeRequest({action:"multiget", keys:keysEncoded}, function(ans) {
                var toRemoved = [];
                var now = (new Date()).getTime();
                var expiration = self.getExpirationTime( keyPrefix );
                var result = {};

                for (var i in keysEncoded) {
                    if (typeof ans[i] == 'object' && typeof ans[i].timestamp != 'undefined') {
                        var expiration_time = ans[i].timestamp + expiration;
                        
                        if (expiration_time < now) {
                            toRemoved.push(keysEncoded[i])
                        }
                        else {
                            result[i]=ans[i].value;
                        }
                    }
                }
                if (toRemoved.length > 0) {
                    self.remoteStorage.makeRequest({action:"multiremove", keys:toRemoved}, function() {});
                }
                deferred.resolve(result);
            });
        }
        return deferred.promise();
    },
    set: function(keyPrefix, key, value) {
        var param = {};
        
        param[key] = value;
        return this.setmany(keyPrefix, param);
    },
    setmany: function(keyPrefix, data) {
        var deferred = jQuery.Deferred();

        if (!this.hasStorage) {
            deferred.resolve();
        }
        else {
            var keysEncoded = {};
            
            for (var key in data) {
                keysEncoded[this.buildKey(keyPrefix, key)] = {value : data[key], timestamp: (new Date()).getTime()};
            }
            this.remoteStorage.makeRequest({action:"multiset", values:keysEncoded}, function() {
                deferred.resolve();
            });
        }
        return deferred.promise();
    },
    remove: function(keyPrefix, key) {
        var deferred = jQuery.Deferred();
        var keyEncoded = this.buildKey(keyPrefix, key);

        this.remoteStorage.makeRequest({action:"remove", key:keyEncoded}, function() {
            deferred.resolve();
        });
        return deferred.promise();
    }
};

window.LocalCache.init();
