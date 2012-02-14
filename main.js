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

function GBAPI (key, baseLimit){
	this.apiKey = key
	this.baseLimit = baseLimit || 100
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
	params.offset = params.offset || 0
	
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
	if( typeof cb !== 'function')
		cb = console.log
	
	console.log('request for url:', url)
	
	request.get( url, function(err, req, body) {
		cb( err, JSON.parse(body) )
	})
}

/*
 * Retrieve id and name of platforms
 */
GBAPI.prototype.platforms = function(cb, offset) {
	
	var url = this.buildUrl('platforms/', {
		field_list: 'id,name',
		offset: offset,
	})
	
	this.exec( url, cb )
};

/*
 * Retrieve all games from a platform
 */
GBAPI.prototype.gamesOfPlatform = function(platformId, cb, offset) {
	
	var url = this.buildUrl('games/', {
		platforms: platformId,
		field_list: 'id,name',
		offset: offset,
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



module.exports = GBAPI
