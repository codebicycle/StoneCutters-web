define(['views/item/ItemView', 'helpers/CategoryHelper'], 
	function(ItemView, CategoryHelper) {
	describe('The item page',function(){
		
		var callbacks = {};

		//Create an easily-removed container for our tests to play in
		beforeEach(function() {
			setFixtures('<div id="home"><div id="left-panel" data-role="panel"></div><div id="header" data-role="header"><a href="#left-panel" data-rel="panel">Categories</a><h1>ARWEN</h1></div><div id="content" data-role="content"></div></div>');
			CategoryHelper.categories.reset();
		});

		afterEach(function () {
			expect(callbacks.doneItems).toHaveBeenCalled();
		});

		//Specs
		it('should load the item from the json response',function(){
			
			var item = {"location":{"latitude":0.0,"longitude":0.0},"username":"","description":"Lindos filhotes","price":850.0,"id":484949563,"date":"2013-02-22T13:02:42.000-0500","displayPrice":"R$850","category":{"id":812,"name":"Dogs","parentId":811},"optionals":[],"title":"Lindos filhotes de shih-tzu com pedigree","myOLXData":{"favorite":false,"onApproval":false},"images":[{"url":"http://images01.olx-st.com/ui/15/98/63/1361556161_484949563_4-Lindos-filhotes-de-shih-tzu-com-pedigree-Animais.jpg","thumbUrl":"http://images01.olx-st.com/ui/15/98/63/t_1361556161_484949563_4.jpg","displayOrder":1},{"url":"http://images01.olx-st.com/ui/15/98/63/1361556161_484949563_2-Lindos-filhotes-de-shih-tzu-com-pedigree-Salvador.jpg","thumbUrl":"http://images01.olx-st.com/ui/15/98/63/t_1361556161_484949563_2.jpg","displayOrder":2},{"url":"http://images01.olx-st.com/ui/15/98/63/1361556161_484949563_3-Lindos-filhotes-de-shih-tzu-com-pedigree-Cachorros.jpg","thumbUrl":"http://images01.olx-st.com/ui/15/98/63/t_1361556161_484949563_3.jpg","displayOrder":3},{"url":"http://images01.olx-st.com/ui/15/98/63/1361556161_484949563_5-Lindos-filhotes-de-shih-tzu-com-pedigree-Bahia.jpg","thumbUrl":"http://images01.olx-st.com/ui/15/98/63/t_1361556161_484949563_5.jpg","displayOrder":4},{"url":"http://images01.olx-st.com/ui/15/98/63/1361556161_484949563_1-Fotos-de--Lindos-filhotes-de-shih-tzu-com-pedigree.jpg","thumbUrl":"http://images01.olx-st.com/ui/15/98/63/t_1361556161_484949563_1.jpg","displayOrder":5}],"phone":"7188181314"};
			var relatedAds = [ 
				{"id":"484949563", "title":"Chihuahua Puppies For Sale","thumbnail":"http://petliferadio.com/doggydog.jpg"},
	           	{"id":"484949178", "title":"Gun Dog Stud Many Willowyck & Drakeshead Lns","thumbnail":"http://www.cck9.com/wp-content/uploads/2009/09/German-shepherd-protection-dogs-CCK9-Blog-300x300.jpg"},
	           	{"id":"484940969", "title":"Siberian Husky Female Puppy For Sale","thumbnail":"http://static.ddmcdn.com/gif/bad-dog-training-behavior-300.jpg"},
	           	{"id":"484940652", "title":"Black And Yellow Labrador Puppies","thumbnail":"http://assets.archivhadas.es/system/tog_forum/topics/images/5395/big_perro-dog-cl.jpg"},
	           	{"id":"484939846", "title":"11 Week Old Kc Reg Lab Dog For Sale","thumbnail":"http://dogwalking.dogster.com/wp-content/themes/alcottTheme/uploads/Dog-Park-Safety.jpg"},
	           	{"id":"484937518", "title":"Stunning Litter Of K.c","thumbnail":"http://img.ehowcdn.com/article-new/ehow/images/a04/qu/7b/signs-symptoms-dog-food-poisoning-800x800.jpg"},
	           	{"id":"484936416", "title":"Barney At Wolfabulls Bulldogs","thumbnail":"http://www.theworld.org/wp-content/uploads/Q-dog-300x300.jpg"},
            ];
            
            callbacks.doneItems = function(page){
				page.render();
      			
      			//Item's expectations
	      		expect($('#itempage .title h1').html()).toBe("Lindos filhotes de shih-tzu com pedigree");
	      		expect($('#itempage .title h4').html()).toBe("R$850");
	      		expect($('#itempage .description').html()).toBe("Lindos filhotes");
	      		expect($('#itempage #image-slider li img').length).toBe(5);
			}

			spyOn(callbacks,'doneItems').andCallThrough();

			var dfd = $.Deferred().done(_.bind( callbacks.doneItems, this));

			spyOn($,'ajax');

 			view = new ItemView({'deferred': dfd, 'id': 484949563});

 			$.ajax.calls[0].args[0].success(item);
 			$.ajax.calls[1].args[0].success(relatedAds);

 			//Related Ads' expectations
      		expect($($('#itempage #image-slider-related li a figure')[0]).html().replace(/^\s+|\s+$/g,'')).toBe('<img src="http://petliferadio.com/doggydog.jpg" alt="">'); 
      		expect($('#itempage #image-slider-related li img').length).toBe(7);
	
		});

	});
});