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
	}
  };
};
