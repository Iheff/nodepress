
/*
 * GET home page.
 */
var config = require('../nodepress_config.js')
,   request = require("request")
,   cache = require("memory-cache")
,   the_date = new Date; // Generic JS date object
var pagedata=[];
var unixtime_ms = the_date.getTime(); // Returns milliseconds since the epoch
var now = parseInt(unixtime_ms / 1000);

function getCachedItem(url, callback){
	if(cache.get(url) == null){
		console.log(url+"is not a currently cached item.");
		
		request(url, function(error, response, api_response) {
			response_data = eval("(" + api_response + ")");
			console.log("fetchibg a cache for "+url)
			cache.put(url, api_response, config.cache_time);
			cache.put(url+"-bkp", api_response);
			if(cache.get(url) == null){
				console.log('did not save cache');
			} else {
				console.log('did save cache');
			}
			callback(response_data);
		});

	}else{
		console.log(url+"is a cached item.");
		callback(cache.get(url));

	}
}
function getCacheOrBackUpItem(url, callback){
if(cache.get(url) == null){
		console.log('using BACKUP for item cache this time.');
		getCachedItem(url, function(){
			console.log('go create a new cache for '+ url);
			item_data = cache.get(url+"-bkp");
			callback(item_data);
		});	
		
	} else {
		console.log('using regular item cache Hombre.');
		item_data = cache.get(url);
		callback(item_data);
	}
	
};

function getCachedMenu(){
menu_data=[];
if(cache.get('menuObject') == null){
	console.log("menuObject currently Null")
	if(cache.get('get_category_index') == null){
		menu_data = "No Menu Yet";
		request( config.OG_WP+"?json=get_category_index", function(error, response, api_response) {
			menu_data = eval("(" + api_response + ")");
			cache.put('get_category_index', api_response, config.cache_time);
			console.log("cacheing category menu data");
			var menu = [];
			var menu_tick = 0;
			for (var i = menu_data.categories.length - 1; i >= 0; i--) {
				if(menu_data.categories[i].parent == 0){
					var id = menu_data.categories[i].id;
					menu["id-"+id] = menu_data.categories[i];
					}
			};
			for (var i = menu_data.categories.length - 1; i >= 0; i--) {		
				if(menu_data.categories[i].parent != 0){
					var id = menu_data.categories[i].id;
					if("children" in menu["id-"+menu_data.categories[i].parent]){					
					} else{
						menu["id-"+menu_data.categories[i].parent].children = [];
					}
					menu["id-"+menu_data.categories[i].parent].children.push(menu_data.categories[i]);
				}
			};
		});
	} else{
		menu_data = eval("(" + cache.get('get_category_index') + ")");
		console.log("using cached menu data");
			var menu = [];
			var menu_tick = 0;
			for (var i = menu_data.categories.length - 1; i >= 0; i--) {
				if(menu_data.categories[i].parent == 0){
					var id = menu_data.categories[i].id;
					menu["id-"+id] = menu_data.categories[i];
					}
			};
			for (var i = menu_data.categories.length - 1; i >= 0; i--) {		
				if(menu_data.categories[i].parent != 0){
					var id = menu_data.categories[i].id;
					if("children" in menu["id-"+menu_data.categories[i].parent]){					
					} else{
						menu["id-"+menu_data.categories[i].parent].children = [];						
					}
					menu["id-"+menu_data.categories[i].parent].children.push(menu_data.categories[i]);
				}
			};
	}

if(cache.get('get_page_index') == null){
		request( config.OG_WP+"?json=get_page_index", function(error, response, api_response) {
			menu_data2 = eval("(" + api_response + ")");
			menu_data.pages =menu_data2.pages;
			cache.put('get_page_index', api_response, config.cache_time);
			//console.log("cacheing page menu data");			
			for (var i = menu_data.pages.length - 1; i >= 0; i--) {
				if(menu_data.pages[i].parent == 0){
					var id = menu_data.pages[i].id;
					menu["id-"+id] = menu_data.pages[i];
					}
			};
			cache.put('menuObject', menu_data, cache_time);
			//console.log("cached MenuObject");			
			
			cache.put('menuObjectBackup', menu_data);
			//console.log(".... and cached menuObjectBackup");
		});
	} else{
		menu_data2 = eval("(" + cache.get('get_page_index') + ")");
		menu_data.pages = menu_data2.pages;
		//console.log("using cached page menu data");
			for (var i = menu_data.pages.length - 1; i >= 0; i--) {
				if(menu_data.pages[i].parent == 0){
					var id = menu_data.pages[i].id;
					menu["id-"+id] = menu_data.pages[i];		
				}
			};
	}

} else {
	menu_data = cache.get("menuObject");
}
return menu_data;
}


function getCachedMenuOrBackup(){
	if(cache.get('menuObject') == null){
		//console.log('using BACKUP for cache');
		getCachedMenu();
		menu_data = cache.get('menuObjectBackup');
	} else {
		//console.log('using regular cache Hombre');
		menu_data = cache.get('menuObject');
	}
	return menu_data;
}


exports.index = function(req, res){
	res.header("X-powered-by", config.powered_by);
    var page_number = 1;
	if(req.params.page_number){
		page_number=req.params.page_number;
	}
	
	var pagedata=[];	
	pagedata.menu =getCachedMenuOrBackup();
	pagedata.page =page_number;
	pagedata.now =now;
	pagedata.title = "FifthColumn";
	
	url = config.OG_WP+"?json=get_recent_posts&page="+page_number+config.fields;

	getCacheOrBackUpItem(url, function(response){
		pagedata.api = eval("(" + response + ")");
		res.render('index',  pagedata);
	});

};


exports.article = function(req, res){
	res.header("X-powered-by", config.powered_by);

	pagedata.menu =getCachedMenuOrBackup();
	pagedata.now =now;
	pagedata.title = "FifthColumn";
	pagedata.hosts = [];
	pagedata.hosts.new = req.headers.host;
	pagedata.hosts.old = config.OG_WP;

	var slug = req.params.slug;
	url =config.OG_WP+"?json=get_post&slug="+slug+config.fields;

	getCacheOrBackUpItem(url, function(response){
		console.log('loading artilcle data ...');
		pagedata.api = eval("(" + response + ")");
		res.render('article', pagedata);
	});
};

exports.page = function(req, res){
	res.header("X-powered-by", config.powered_by);
	console.log( "host= "+req.headers.host);
	var slug = req.params.page;

	pagedata.menu =getCachedMenuOrBackup();
	pagedata.now =now;
	pagedata.title = "FifthColumn";

	var url = config.OG_WP+"?json=get_page&slug="+slug;
	getCacheOrBackUpItem(url, function(response){
		console.log('loading page data ...');
		pagedata.api = eval("(" + response + ")");
		res.render('page', pagedata);
	});

};

exports.category = function(req, res){
	res.header("X-powered-by", config.powered_by);
	var page_number = 1;
	if(req.params.page_number){
		page_number=req.params.page_number;
	}
	
	var slug = req.params.category;
	
	pagedata.menu =getCachedMenuOrBackup();
	pagedata.page =page_number;
	pagedata.now =now;
	pagedata.title = "FifthColumn";

	var url = config.OG_WP+"?json=get_category_posts&slug="+slug;
	getCacheOrBackUpItem(url, function(response){
		console.log('loading category data ...');
		pagedata.api = eval("(" + response + ")");
		res.render('category',pagedata);
	});
};
