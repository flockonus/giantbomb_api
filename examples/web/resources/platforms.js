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