if( typeof jQuery !== 'function' ){
	throw new Error('Kaiser demands jQuery >1.6')
}



(function(j) {

// my only GLOBAL
Kaiser = {}

Kaiser.onLoad = function () {
	j('#headerC').html(
		jQuery('<div/>', {
	    text: 'ROOT'
		})
	)
	j('#flash').hide()
	// TODO contentC gets Kaiser.root classes displayed like a boss!
	//   maybe.. <a href="" class="klink [classe] >[name]</a>"
}

// return a complete Concept Object
Kaiser.concept = function(name, baseUrl, classe) {
	return {
		name: name,
		baseUrl: baseUrl,
		classe: classe,
		page: 1,
		maxPages: null,
	}
};

// all models available
Kaiser.concepts = {
	platforms: Kaiser.concept('Platforms', 'platforms/', 'platforms'),
}

// All states enabled to be listed from zero
Kaiser.root = ['platforms']

// holds active States, starts Empty
Kaiser.hierarchy = []

j(document).ready(Kaiser.onLoad)

})(jQuery)