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
      			{ cwd:'dist',src: ['**'] }
    		],
		  options: {
		    publish: [{
          		id: 'olx.arwen:arwen-dynamic:zip:1.1.1',          		
          		name: 'arwen-dynamic',
          		path: 'dist/',
          		group_id: 'olx.arwen',
          		ext: 'zip'
      		}]
		  }
		},
		'build-static': {
		  files: [
      			{ cwd:'dist',src: ['**'] }
    		],
		  options: {
		    publish: [{
          		id: 'olx.arwen:arwen-static:zip:1.1.1',
          		name: 'arwen-static',
          		path: 'dist/',
          		group_id: 'olx.arwen',
          		ext: 'zip'
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
