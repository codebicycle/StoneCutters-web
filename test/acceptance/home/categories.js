'use strict';

var _ = require('underscore');
var should = require('should');
var hosts = ['html4.m.olx.in'];
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
        describe('html4', function test() {
            var browser = browsers.html4;

            before(function before(done) {
                browser
                    .visit('http://' + hosts[0] + '/')
                    .then(function() {
                        return browser.clickLink('Vehicles');
                    })
                    .then(done, done);
            });
            it('should have the following path "/vehicles-cat-362"', function test(done) {
                browser.location.pathname.should.equal('/vehicles-cat-362');
                done();
            });
            it('should have subcategory Cars but not Tablets', function test(done) {
                should.exist(browser.link('a[href*="/cars-cat-378"]'));
                should.not.exist(browser.link('a[href*="/tablets-cat-857"]'));
                done();
            });
        });
    });
});
