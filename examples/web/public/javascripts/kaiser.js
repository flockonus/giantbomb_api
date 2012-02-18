if( !(typeof jQuery === 'function' && typeof _ === 'function') ){
	throw new Error('Kaiser demands jQuery >1.6 and Underscore.js')
}



(function(j) {

// my only GLOBAL
Kaiser = {
	stack: [], // holds active States, starts Empty
	root: [],
	cache: {}, // holds loaded resources
	transitioning: false,
	noticing: false,
	noticeTime: 3000
}

Kaiser.notice = function (msg) {
	// there can be only 1 notice at a time,
	if( Kaiser.noticing ){ // then bounceOff!
		setTimeout( Kaiser.notice, 300, msg)
	} else { // only one notice at a time!
		Kaiser.noticing = true
		j('#flash').text(msg).fadeIn('fast', 
			function() { // fadeIn callback
				setTimeout( function(){
					j('#flash').fadeOut('fast', 
						function() { // fadeOut callback
							Kaiser.noticing = false
						}
					)
				}, Kaiser.noticeTime)
			}
		)
	}
};

function transitionIn() {
	if( Kaiser.transitioning ){
		return false
	} else {
		Kaiser.transitioning = true
		j('#contentC').html( j('#spinnerC').show() )
		return true
	}
}

function transitionOff() {
	Kaiser.transitioning = false
	j('#spinnerC').prependTo('body').hide()
	return true
}



Kaiser.fetchResource = function( resource, id, refresh, cb ) {
	if( !( (typeof resource === 'string') && Kaiser.resources[resource]) ){
		var err = new Error("Invalid resource")
		cb(err, null)
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
}

function kbackHandler (e) {
	// do not work between resource-loading
	if( !Kaiser.transitioning ){
		var je = j(e.currentTarget)
		
		Kaiser.popState(  )
	} else {
		Kaiser.notice
	}
	
	return false
	
	/* this option was getting too complex.. so no more abort-resource-loading for now
	 
	// This mean interruption of resource-loading, user clicked [X]
	if( Kaiser.transitioning ){
		Kaiser.abortTransition = true
		transitionOff()
	} else {
		// Regular [X], just have to pop the state back!
		Kaiser.popState()
	}
	*/
}

function klinkHandler (e) {
	// kinda like a weak mutex
	if( !transitionIn() ){
		// in case another transition is already happening must ignore click.
		return false
	}
	
	var je = j(e.currentTarget)
		,	resource = je.data('resource')
		,	id = je.data('id')
		,	refresh = je.data('refresh')
	
	if( typeof je.data('resource') !== 'string' ){
		transitionOff()
		throw new Error("every .klink should point to a resource" )
	}
	
	
	var currentState = _.clone(Kaiser.resources[resource])
	currentState.id = id
	currentState.title = je.text() || currentState.name
	
	// add header before response just to add some feedback
	addHeader( currentState )
	
	var content = Kaiser.fetchResource( resource, id, refresh, function(err, data) {
		transitionOff()
		if(err){
			j('#contentC').text('FATAL ERROR, see console')
			throw err
		}
		
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
	
	j('.kback').live( 'click', kbackHandler )
	
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
	// some code to disable the previous state
	j('#headerC > div:last').children().removeClass('kback')
	
	// TODO something better..
	var header = '<div>'+
		'<div class="row-first kback">&#10007;</div>'+
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
	
	// some code to add content since header was added before
	j('#contentC').html(state.content)
	
	Kaiser.stack.push( state )
};

Kaiser.popState = function(  ) {
	j('#headerC > div:last').remove()
	Kaiser.stack.pop()
	
	// some code to restore previous state(content)!
	var currentState = Kaiser.currentState()
	if( currentState ){
		j('#contentC').html(currentState.content)
	} else {
		j('#contentC').html( Kaiser.cache.root )
	}
	j('#headerC > div:last').children('.row-first').addClass('kback')
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