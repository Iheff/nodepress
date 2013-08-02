
/**
 * Module dependencies.
 */



var express = require('express')
  , request = require("request")
  , routes = require('./routes')
  , cache = require("memory-cache")
  , gzippo = require("gzippo");
  var config = require('./nodepress_config.js')
require('./my-ejs-helpers');
var  menu_data = [];
var app = module.exports = express.createServer();

    request( config.OG_WP+"?json=get_category_index", function(error, response, api_response) {
      menu_data = eval("(" + api_response + ")");
      cache.put('get_category_index', api_response, config.cache_time);
      //console.log("cacheing category menu data");
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
      cache.put('menuObject', menu_data, config.cache_time);
      cache.put('menuObjectBackup', menu_data); 
    });

    });
    


app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.favicon(' '));
  app.locals.dependenciesntify = function(string) {
  return (string);
}

app.use(express.compiler({ src : __dirname + '/public', enable: ['less']}));
  app.use(app.router);
  //app.use(express.static(__dirname + '/public'));
  app.use(gzippo.staticGzip(__dirname + '/public'));
  app.use(gzippo.compress());
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});


// Compatible

// Now less files with @import 'whatever.less' will work(https://github.com/senchalabs/connect/pull/174)
var TWITTER_BOOTSTRAP_PATH = './vendor/twitter/bootstrap/less';
express.compiler.compilers.less.compile = function(str, fn){
  try {
    var less = require('less');var parser = new less.Parser({paths: [TWITTER_BOOTSTRAP_PATH]});
    parser.parse(str, function(err, root){fn(err, root.toCSS());});
  } catch (err) {fn(err);}
}

// Routes

app.get('/', routes.index);
app.get('/p/:page_number', routes.index);
// TODO: "/:category" needs to be replaced with literals so as links to category items can include categories //
app.get('/:category', routes.category);
app.get('/:category/p/:page_number', routes.category);
app.get('/article/:slug', routes.article);
app.get('/page/:page', routes.page);

app.listen(4321, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
