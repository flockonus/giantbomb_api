
/**
 * Run this program with the first param being your GiantBomb API key, ex:
 * 
 *   node app.js cbddec5e8c39103d16a722ae08a30ea6a...
 * 
 */

var express = require('express')
	,	GBAPI =   require('../../main.js')
	, util =    require('util')

var app = module.exports = express.createServer()
	, swig = require('./lib/swig') // https://github.com/paularmstrong/swig/tree/master/docs
	, gb = new GBAPI(process.argv[2]);

// lazy, I know..
GLOBAL.gb = gb

swig.init({
  root: __dirname + '/views',
  allowErrors: true,
  cache: false,
  //filters: require('./helpers/filters.js'),
});

app.configure(function(){
  app.use(express.logger({format: "dev" }));
  app.set('views', __dirname + '/views');
  app.register('.html', swig);
	app.set('view engine', 'html');
	app.set('view options', { layout: false });
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'm1szXCzzaRockFakcielao2103ujasi09Gri55wqp3va' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});



// Routes

app.get('/', function(req, res){
  res.render('index',{});
});

app.get('/platforms', require('./resources/platforms').index )


app.listen(8143);
console.log("Express server listening on port %d", app.address().port);
