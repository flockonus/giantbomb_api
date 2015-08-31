// Copyright 2012 Fabiano P Soriani
//
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.
//
/*



GBAPI = require('./main.js'); gb = new GBAPI('cbddec5e8c39103d16a722ae08a30ea6a883????', 3);
gb.platforms()
gb.gamesOfPlatform( 36 ) // wii
gb.game( 67, function(err, resp){ console.log( resp.results.name, '-', resp.results.original_release_date ) } ) // tiger woods
*/


var request = require('request')
	, base_url = 'http://api.giantbomb.com/'
	,	qs = require('qs')

function GBAPI (key, baseLimit, cacheHours){
	this.apiKey = key
	this.baseLimit = baseLimit || 100
	this.cacheHours = cacheHours || 0
	this.cache = {}
}

/*
 * Helper method for building full a URL
 * @param {String} path	A valid path for the URL, always finish with a slash, ex: 'games/', 'game/67/'
 * @param {Object} params	Some parameter for the URL, see http://api.giantbomb.com/documentation/ for fields
 * @return {String} a ready-to-use URL including api_key, format, limit, offset and +
 */
GBAPI.prototype.buildUrl = function( path, params ){
	if( typeof params !== 'object' )
		params = {}
	params.api_key = this.apiKey
	params.limit = params.limit || this.baseLimit
	params.format  = 'json'
	if( params.page ){ // 1, 2, .. infinity
		params.offset = (params.page - 1)*this.baseLimit
		delete params.page
	} else {
		params.offset = params.offset || 0
	}

	var url = base_url
	url += path+"?"
	url += qs.stringify(params)
	return url
}

/*
 * Convenience caller of URLs
 * @param {String} url a ready-to-use URL of giantbomb API
 * @param {Function} cb a callback function, first param is a possible error, second is the object with the full response. Defaults to console.log
 */
GBAPI.prototype.exec = function( url, cb ){
	var ctx = this
	if( typeof cb !== 'function')
		cb = console.log


	// try cache first
	var now = (new Date)
	if( this.cacheHours && this.cache[url] && (now - this.cache[url].at)/3600000 < this.cacheHours ){
		console.log("cache HIT:", url)
		cb(null, this.cache[url].data)
	} else {
		console.log('requesting url:', url)
		request.get( url, function(err, req, body) {
			var data = JSON.parse(body)
			if( data.status_code > 1 && !err ){
				err = data
			} else {
				ctx.cache[url] = {
					data: JSON.parse(body), // copying is safer
					at: new Date(),
				}
			}
			//console.log("---", err, data)
			cb( err, data )
		})
	}
}

/*
 * Retrieve id and name of platforms
 */
GBAPI.prototype.platforms = function(cb, page) {

	var url = this.buildUrl('platforms/', {
		field_list: 'id,name',
		page: page,
	})

	this.exec( url, cb )
};

/*
 * Retrieve all games from a platform
 */
GBAPI.prototype.gamesOfPlatform = function(platformId, cb, page) {

	var url = this.buildUrl('games/', {
		platforms: platformId,
		field_list: 'name,id,original_release_date,number_of_user_reviews',
		page: page,
	})

	this.exec( url, cb )
};

/*
 * Retrieve all specific data from a game!
 */
GBAPI.prototype.game = function(gameId, cb) {

	var url = this.buildUrl('game/'+gameId+'/', {} )

	this.exec( url, cb )
};

/*
 * Search for a game title by name
 */
GBAPI.prototype.searchForGameByName = function(gameName,cb){

	var url = this.buildUrl('search/',{
		query: gameName,
		resources: "game",
		limit: 1
	})

	this.exec( url, cb )
};

module.exports = GBAPI
