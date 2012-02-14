
/**
 * Run this program with the first param being your GiantBomb API key, ex:
 *   node app.js cbddec5e8c39103d16a722ae08a30ea6a...
 */

var express = require('express');

var app = module.exports = express.createServer()
	, swig = require('./lib/swig') // https://github.com/paularmstrong/swig/tree/master/docs

swig.init({
  root: __dirname + '/views',
  allowErrors: true,
  cache: false,
  //filters: require('./helpers/filters.js'),
});

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
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
  res.render('index', {
    title: 'Express'
  });
});

app.listen(8143);
console.log("Express server listening on port %d in %s mode", app.address().port);
