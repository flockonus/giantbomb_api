module.exports = function(app){

	var platforms = require('./resources/platforms')
		,	games = require('./resources/games')
	
	app.get('/', function(req, res){
	  res.render('index',{});
	});
	
	app.get('/platforms',     platforms.index )
	app.get('/platforms/:id', platforms.show )
	
	app.get('/games/:id', games.show)
}