'use strict';

var _ = require('underscore');
var should = require('should');
var hosts = ['m.olx.com.ar', 'm.olx.com.br'];
var userAgents = ['UCWEB/8.8 (iPhone; CPU OS_6; en-US)AppleWebKit/534.1 U3/3.0.0 Mobile', 'Mozilla/4.0 (compatible; MSIE 7.0; Windows Phone OS 7.0; Trident/3.1; IEMobile/7.0) Asus;Galaxy6', 'Nokia6100/1.0 (04.01) Profile/MIDP-1.0 Configuration/CLDC-1.0'];
var Browser = require('../zombie')();
var browsers = {
    wap: new Browser({
        userAgent: userAgents[2]
    }),
    html4: new Browser({
        userAgent: userAgents[1]
    }),
    html5: new Browser({
        userAgent: userAgents[0]
    })
};

describe('home', function test() {
    describe('categories', function test() {
        describe('html5', function test() {
            var browser = browsers.html5;

            before(function before(done) {
                browser
                    .visit('http://m.olx.com.ar:3030/')
                    .then(function() {
                        return browser.clickLink('Vehicles');
                    })
                    .then(done, done);
            });
            it('should have subcategory Cars but not Cellphones', function test(done) {
                browser.location.pathname.should.equal('/change-this-description-for-the-category-cat-362');
                should.exist(browser.link('Cars'));
                should.not.exist(browser.link('Cellphones'));
                done();
            });
        });
    });
});
