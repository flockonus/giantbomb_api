var util = require('util')

exports.index = function(req, res){
	var page = (req.query.page || 0)*100
	
	gb.platforms(function(err, data){
		if( err || !data ){
			res.end(util.inspect(err))
		} else {
		  res.render('platforms',{results:data.results});
		}
	}, page)
}

exports.show = function(req, res){
	var id = parseInt(req.params.id)
	var page = (req.query.page || 0)*100
	
	if( id ){
		gb.gamesOfPlatform( id, function(err, data){
			if( err || !data ){
				res.end(util.inspect(err))
			} else {
			  res.render('platform',{results:data.results});
			}
		}, page )
	} else {
		res.end('bad request')
	}
}