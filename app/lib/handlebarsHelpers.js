/**
 * We inject the Handlebars instance, because this module doesn't know where
 * the actual Handlebars instance will come from.
 */
module.exports = function(Handlebars) {
  return {
    copyright: function(year) {
      return new Handlebars.SafeString("&copy;" + year);
    },
    moduloIf: function(index_count,mod,block) {
	  if(parseInt(index_count)%(mod)=== 0){
	    return block.fn(this);}
	},
	gte: function(a,b,block) {
	  if(parseInt(a)>=parseInt(b)){
	  	return block.fn(this);
	  }
	},
	lt: function(a,b,block) {
	  if(parseInt(a)<parseInt(b)){
	  	return block.fn(this);
	  }
	},
	eq: function(a,b,block) {
	  if(a == b){
	  	return block.fn(this);
	  }
	},
	ifC: function (v1, operator, v2, options) {

	    switch (operator) {
	        case '==':
	            return (v1 == v2) ? options.fn(this) : options.inverse(this);
	        case '===':
	            return (v1 === v2) ? options.fn(this) : options.inverse(this);
	        case '<':
	            return (v1 < v2) ? options.fn(this) : options.inverse(this);
	        case '<=':
	            return (v1 <= v2) ? options.fn(this) : options.inverse(this);
	        case '>':
	            return (v1 > v2) ? options.fn(this) : options.inverse(this);
	        case '>=':
	            return (v1 >= v2) ? options.fn(this) : options.inverse(this);
	        case '&&':
	            return (v1 && v2) ? options.fn(this) : options.inverse(this);
	        case '||':
	            return (v1 || v2) ? options.fn(this) : options.inverse(this);
	        default:
	            return options.inverse(this);
	    }
  	}
  };
};
