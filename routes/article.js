
/*
 * GET home page.
 */

var request = require("request")
,   cache = require("memory-cache");

exports.index = function(req, res){

	 var post_slug = req.params.post_slug;
	 res.send(post_slug);
	if(cache.get('get_recent_posts') == null){  // IF the cache is blank
		console.log( "host= "+req.headers.host)
		request("http://soundophiles.com/api/get_posts/?slug="+post_slug, function(error, response, api_response) {
			the_post = eval("(" + api_response + ")");
			cache.put('post_id', api_response, 60000);
			console.log("just cached");
	  		res.render('article', { title: 'Truethat.com', api: the_post })
		});
	} else { // else use the cache
			home_posts = eval("(" + cache.get('post_id') + ")");
			console.log("Using cached");
	  		res.render('article', { title: 'Truethat.com', api: the_post })
	}

};