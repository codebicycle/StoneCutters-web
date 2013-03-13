({
	appDir: ".",
    baseUrl: "js",
    mainConfigFile: 'js/main.js',
    modules: [
        {
            name: "main"
        }
    ],
    paths: {
    	requireLib: 'libs/require/require-min',
    	jqm: 'libs/jqueryMobile/jquery.mobile-1.3.0.min'
  	},
  	include: ['requireLib','jqm'],
})