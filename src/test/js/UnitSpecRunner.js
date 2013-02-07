require.config({
  baseUrl: "../../src/main/webapp/js/",
  paths: {
    jquery:     'libs/jquery/jquery-1.8.3-min',
    jqm:        'libs/jqueryMobile/jquery.mobile-1.3.0-rc.1.min',
    underscore: 'libs/underscore/underscore-min',
    backbone:   'libs/backbone/backbone-min',
    handlebars: 'libs/handlebars/handlebars-1.0.rc.1-min',
    templates:  '../templates',
    jasmine: 'libs/jasmine/jasmine-1.3.1/jasmine',
    'jasmine-html': 'libs/jasmine/jasmine-1.3.1/jasmine-html',
    'jasmine-jquery': 'libs/jasmine/jasmine-jquery',
    console_runner: 'libs/phantom-jasmine/console-runner',
    spec: '../../../test/js',
    config: '../../../../configuration'
  },
  shim: {
    underscore: {
      exports: "_"
    },
    backbone: {
      deps: ['underscore', 'jquery'],
      exports: 'Backbone'
    },
    jasmine: {
      exports: 'jasmine'
    },
    'jasmine-jquery': {
      deps: ['jasmine', 'jquery'],
      exports: 'jasmine-jquery'
    },
    'jasmine-html': {
      deps: ['jasmine'],
      exports: 'jasmine'
    },
    console_runner: {
      deps: ['jasmine']
    },
    handlebars: {
      exports: 'Handlebars'
    }
  }
});


window.store = "TestStore"; // override local storage store name - for testing

require(['underscore', 'jquery', 'jasmine-html', 'console_runner', 'jasmine-jquery'], function(_, $, jasmine){

  //this code enables a nicer html reporter to run locally (i.e not on jenkins)
  // var jasmineEnv = jasmine.getEnv();
  // jasmineEnv.updateInterval = 1000;

  // var htmlReporter = new jasmine.HtmlReporter();

  // jasmineEnv.addReporter(htmlReporter);

  // jasmineEnv.specFilter = function(spec) {
  //   return htmlReporter.specFilter(spec);
  // };

  var console_reporter = new jasmine.ConsoleReporter();

  window.console_reporter = console_reporter;

  jasmine.getEnv().addReporter(new jasmine.TrivialReporter());
  jasmine.getEnv().addReporter(console_reporter);

  var specs = [];

  specs.push('spec/unitTests/category_model_unit_spec');
  specs.push('spec/unitTests/sliding_menu_unit_spec');

  $(function(){
    require(specs, function(){
      jasmine.getEnv().execute();
    });
  });

});