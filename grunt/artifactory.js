'use strict';

module.exports = function(grunt) {
    return {
    	//target:'example.zip',
    	options: {
    		url: 'http://jfrog.olx.com.ar',
	  		repository: 'mobile-jenkins-release',
	  		username: 'mobile-jenkins',
	  		password: 'm0b1l30lx',
  		},
		'build-dynamic': {
		  files: [
      			{ src: ['dist/**/*'] }
    		],
		  options: {
		    publish: [{
          		id: 'olx.arwen:dynamic:zip:1000',
          		/*name: 'arwen-dynamic',
          		version: '1000', 
          		path: 'dist/',
          		group_id: 'olx.arwen',
          		ext: 'zip'*/
      		}]
		  }
		},
		'build-static': {
		  files: [
      			{ src: ['dist/**/*'] }
    		],
		  options: {
		    publish: [{
          		id: 'olx.arwen:static:zip:1000',
          		/*name: 'arwen-static',
          		version: '1000', 
          		path: 'dist/',
          		group_id: 'olx.arwen',
          		ext: 'zip'*/
      		}]
		  }
		}
	};






	  //target:'example.zip',
	  //options: {
	  //  url: 'http://jfrog.olx.com.ar',
	  //  repository: 'mobile-jenkins-release',
	  //  username: 'mobile-jenkins',
	  //  password: 'm0b1l30lx',
	  //},
	  
	  //release: {
	  //	files: [
	  //		{ src: ['app/**/*'] }
	  //	],
	  //	options: {
	  //    publish: [{
	  //        id: 'com.olx.js:built-artifact:tgz',
	  //        version: '300', 
	  //        path: 'artctory/'
	  //    }]
	  //  }
	  //}

	  //client: {
	  //  files: [
	  //    { src: ['dist/**/*'] }
	  //  ],
	  //  options: {
	  //    publish: [{
	  //        id: 'com.olx.js:built-artifact:tgz',
	  //        version: '300', 
	  //        path: 'artctory/'
	  //    }]
	  //  }
	  //}
      // };
};
