if( !(typeof jQuery === 'function' && typeof _ === 'function') ){
	throw new Error('Kaiser demands jQuery >1.6 and Underscore.js')
}



(function(j) {

// my only GLOBAL
Kaiser = {
	stack: [], // holds active States, starts Empty
	root: [],
	cache: {}, // holds loaded resources
}

Kaiser.fetchResource = function( resource, id, refresh, cb ) {
	if( !( (typeof resource === 'string') && Kaiser.resources[resource]) ){
		throw new Error("Invalid resource")
	}
	
	var url = Kaiser.resources[resource].baseUrl
	if( id ) url += id
	// do we this request on cache?
	if( Kaiser.cache[url] && !refresh ){
		console.log('cached: ', url)
		cb(null, Kaiser.cache[url])
		
	} else { // we must fetch it from server
		
		j.ajax({
			url: url,
			error: function(a,err,c) {
				cb(err, {})
			},
			success: function(data,b,c) {
				console.log('fetched: ', url)
				Kaiser.cache[url] = data
				cb( null, data )
			},
		})
	}
};

function klinkHandler (e) {
	var je = j(e.currentTarget)
		,	resource = je.data('resource')
		,	id = je.data('id')
		,	refresh = je.data('refresh')
	
	if( typeof je.data('resource') !== 'string' ){
		throw new Error("every .klink should point to a resource" )
	}
	
	var content = Kaiser.fetchResource( resource, id, refresh, function(err, data) {
		if(err){
			j('#contentC').text('FATAL ERROR, see console')
			throw err
		}
		
		var currentState = _.clone(Kaiser.resources[resource])
		currentState.id = id
		currentState.title = je.text() || currentState.name
		// currently only supports html partials
		currentState.content = data
		Kaiser.pushState( currentState )
	})
	
	return false
}

Kaiser.onLoad = function () {
	
	// set header
	j('#headerC').html(
		j('<div/>', {
	    text: 'ROOT'
		})
	)
	j('#flash').hide()
	
	// any attribute with a klink clicked should be nadled
	j('.klink').live( 'click', klinkHandler )
	// TODO contentC gets Kaiser.root classes displayed like a boss!
	//   maybe.. <a href="" class="klink [classe] >[name]</a>"
	
	// append all roots as ul-li
	j('#contentC').append('<ul></ul>')
	if( !Kaiser.root.length ) throw new Error("Kaiser.root must point to at least to 1 element")
	_.forEach(Kaiser.root, function(resource) {
		if( !Kaiser.resources[resource] ) throw new Error("Come on, it didn't even started yet.. Your root is pointing to some resource not referenced on Kaiser.resources")
		return j('<li/>', {
	    'class': 'klink',
 	    //href: "#",
	    text: Kaiser.resources[resource].name,
	    'data-resource': resource,
		}).appendTo( j('#contentC > ul') )
	})
	
	// cache the root so we can use later !:)
	Kaiser.cache['root'] = j('#contentC').html()
}

function addHeader(state) {
	// TODO something better..
	var header = '<div>'+
		'<div class="row-first">&#10007;</div>'+
		'<div class="row-middle">'+(state.title || state.name)+'</div>'+
		'<div class="row-last">-</div>'+
		'<div class="clear"></div>'+
	'</div>'
	j('#headerC').append(header)
};

Kaiser.currentState = function() {
	// either this or prototype Array for .last()
	return j( Kaiser.stack ).get(-1)
};


Kaiser.pushState = function( state ) {
	
	// TODO some code to validate state
	
	// some code to show it
	j('#contentC').html(state.content)
	addHeader( state )
	
	// TODO some code to disable the previous state
	
	
	Kaiser.stack.push( state )
};

Kaiser.popState = function( state ) {
	// TODO some code remove it
	
	Kaiser.stack.pop()
};


// return a complete Concept Object
Kaiser.resource = function(name, baseUrl) {
	return {
		name: name,
		baseUrl: baseUrl,
		page: 1,
		maxPages: null,
		content: '',
		// title
		// id
	}
};

// all models available
Kaiser.resources = {
	platforms: Kaiser.resource('Platforms', 'platforms/'),
}

// All states enabled to be listed from zero
Kaiser.root.push('platforms')

j(document).ready(Kaiser.onLoad)

})(jQuery)