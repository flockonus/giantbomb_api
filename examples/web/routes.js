module.exports = function(app){

	var platforms = require('./resources/platforms')
	
	app.get('/', function(req, res){
	  res.render('index',{});
	});
	
	app.get('/platforms',     platforms.index )
	app.get('/platforms/:id', platforms.show )
}