({
	appDir: '.',
    baseUrl: 'js',
    mainConfigFile: 'js/main.js',
    paths: {
        requireLib: 'libs/require/require-min',
        jqm: 'libs/jqueryMobile/jquery.mobile-1.3.0.min'
    },
    modules: [
        {
            name: 'main',
            include: ['requireLib','jqm'],
            excludeShallow: [
                'config/conf'
            ]
        },
        {
            name: 'config/conf',
            exclude: [
            'underscore', 
            'jquery',
            'backbone'
            ]
        }
    ],
    optimize: "none"
})