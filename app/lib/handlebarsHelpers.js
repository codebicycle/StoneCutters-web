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
	}
  };
};
