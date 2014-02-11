module.exports = {
  setUrlVars: function (app){

  	if (typeof window == 'undefined') {
		return;
	};

  	var location = window.location;
  	var url = location.href;
  	var path = location.pathname;
  	console.log(window.location);

    var viewType = 'unknown';

    switch(path){
        case '/': viewType = 'home';
        break;
        case '/items': viewType = 'listing';
        break;
        //emulate /items/* match
        case '/items/'+ path.slice('/items/'.length): viewType = 'itemPage';
        break;
        default: viewType = 'unknown';
        break;
    }

    app.get("baseData").path = path;
    app.get("baseData").url = url;
    app.get("baseData").viewType = viewType;

  }
};