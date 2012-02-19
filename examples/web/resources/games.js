var util = require('util')


exports.show = function(req, res){
	var id = parseInt(req.params.id)
	var page = (parseInt(req.query.page) || 1)
	
	if( id ){
		gb.game( id, function(err, data){
			if( err || !data ){
				res.end(util.inspect(err))
			} else {
			  res.render('game',{game:data.results});
			}
		}, page)
	} else {
		res.end('bad request')
	}
}