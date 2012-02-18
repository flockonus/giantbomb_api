var util = require('util')

exports.index = function(req, res){
	var page = (parseInt(req.query.page) || 1)
	
	gb.platforms(function(err, data){
		if( err || !data ){
			res.end(util.inspect(err))
		} else {
			var viewData = {}
			viewData.results = data.results
			data.results = null
			data.page = page
			viewData.meta = data
			// { number_of_page_results: 100,
			  // status_code: 1,
			  // error: 'OK',
			  // results: null,
			  // limit: 100,
			  // offset: 0,
			  // number_of_total_results: 128 }
			  // +page
		  res.render('platforms',viewData);
		}
	}, page)
}

exports.show = function(req, res){
	var id = parseInt(req.params.id)
	var page = (parseInt(req.query.page) || 1)
	
	if( id ){
		gb.gamesOfPlatform( id, function(err, data){
			if( err || !data ){
				res.end(util.inspect(err))
			} else {
				var viewData = {}
				viewData.results = data.results
				data.page = page
				data.id = id
				data.results = null
				viewData.meta = data
				// { number_of_page_results: 100,
				  // status_code: 1,
				  // error: 'OK',
				  // results: null,
				  // limit: 100,
				  // offset: 0,
				  // number_of_total_results: 1343 }
				  // +page
			  res.render('platform',viewData);
			}
		}, page)
	} else {
		res.end('bad request')
	}
}