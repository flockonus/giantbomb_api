if( !(typeof jQuery === 'function' && typeof _ === 'function') ){
	throw new Error('Kaiser demands jQuery >1.6 and Underscore.js')
}



(function(j) {

// only GLOBAL
Kaiser = {
	stack: [], // holds active States, starts Empty
	root: [],
	cache: {}, // holds loaded resources
	resources: {},
	transitioning: false,
	noticing: false,
	noticeTime: 2500
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

// check if is not transitioning, if isn't then do
function transitionIn() {
	if( Kaiser.transitioning ){
		Kaiser.notice('Waiting another resource..')
		return false
	} else {
		Kaiser.transitioning = true
		j('#contentC').html( j('#spinnerC').show() )
		return true
	}
}

// just shuts off the transitioning
function transitionOff() {
	Kaiser.transitioning = false
	j('#spinnerC').prependTo('body').hide()
	return true
}



Kaiser.getResource = function( resource, id, params, refresh, cb ) {
	// currently, resource is only being passed as string
	if( !( (typeof resource === 'string') && ( resource === ':current' || Kaiser.resources[resource])) ){
		var err = new Error("Invalid resource")
		cb(err, null)
	}
	
	// for now covering pagination case
	if( resource === ':current' ){
		resource = Kaiser.currentState()
		id = resource.id
	} else {
		resource = Kaiser.resources[resource]
	}
	
	var url = resource.baseUrl
	if( id ) url += id
	if( !params ) params = {page:1}
	url +=	'?'+j.param(params)
	
	
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

// go back 1 resource level
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
	
	Kaiser.getResource( resource, id, null, refresh, function(err, data) {
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

function loadPage(page){
	console.log( "requiring page..", page )
	if( page && page > 0 ){
		Kaiser.getResource(':current', null, {page:page}, false, function(err,data) {
			transitionOff()
			if(err){
				j('#contentC').text('FATAL ERROR, see console')
				throw err
			}
			
			// currently only supports html partials
			Kaiser.currentState.content = data
			// dont need to set the page as view should do it
			j('#contentC').html(data)
		})
	}
}

function kpageHandler(e) {
	if( !transitionIn() ){
		// in case another transition is already happening must ignore click.
		return false
	}
	// only works if page is numeric and > 0
	var page = parseInt(j(e.currentTarget).children('.page-counter').val())
	loadPage( page )
	return false
};

function knextPageHandler(e){
	
	var state = Kaiser.currentState()
	console.log( "next", "current page:", state.page )
	
	// only act if not on last page!
	if( state.page < state.maxPages && transitionIn() ){
		loadPage( state.page +1 )
	}
	return false
}

function kprevPageHandler (argument) {
	var state = Kaiser.currentState()
	console.log( "prev", "current page:", state.page )
	
	// only act if not on first page!
	if( state.page > 1 && transitionIn()  ){
		loadPage( state.page -1 )
	}
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
	
	j('.kpageform').live( 'submit', kpageHandler )
	
	j('.knext-page').live( 'click', knextPageHandler )
	
	j('.kprev-page').live( 'click', kprevPageHandler )
	
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

function headerTemplate( state ) {
	var header = '<div>'+
		'<div class="row-first kback">&#10007;</div>'+
		'<div class="row-middle">'+(state.title || state.name)+'</div>'+
		'<div class="row-last"><span class="kprev-page">&lsaquo;</span><form class="kpageform"><input type="text" class="page-counter" value="'+state.page+'" /></form>'+
			'/<span class="page-max">'+(state.maxPages||'?')+'</span><span class="knext-page">&rsaquo;</span></div>'+
		'<div class="clear"></div>'+
	'</div>'
	return header
};


function addHeader(state) {
	// some code to disable the previous state
	j('#headerC > div:last').children().removeClass('kback')
	
	j('#headerC').append( headerTemplate(state) )
};

Kaiser.updateHeader = function() {
	j('#headerC > div:last').remove()
	j('#headerC').append( headerTemplate( Kaiser.currentState() ) )
};

Kaiser.currentState = function() {
	// either this or prototype Array for .last()
	return j( Kaiser.stack ).get(-1)
};


Kaiser.pushState = function( state ) {
	// TODO some code to validate state
	
	Kaiser.stack.push( state )
	
	// some code to add content since header was added before
	j('#contentC').html(state.content)
	
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

// all models available --a small but fundamental mistake, resource itself is unaware of own id, shall refactor
Kaiser.resources = {
	platforms: Kaiser.resource('Platforms', 'platforms/'),
	games:     Kaiser.resource('Games', 'games/'),
}



// All states enabled to be listed from zero
Kaiser.root.push('platforms')

j(document).ready(Kaiser.onLoad)

})(jQuery)