module.exports = function(match) {
  match('',                   'home#index');

  // if (global.isServer) {
  //     match('categories',     'categories#index');
  //     match('items',          'items#index');
  // } else {
  // 	  match('categories',     'categories#index');
  //     match('items',          'items#index');
  //     match('categories?*params',     'categories#index');
  //     match('items?*params',          'items#index');
  // }

  match('categories',     'categories#index');
  match('items',          'items#index');
  match('categories?*params',     'categories#index');
  match('items?*params',          'items#index');
  
  //match('categories/:id?*params',	'categories#show');
  match('items/:id',				      'items#show');
};
