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

GBAPI.prototype.exec = function( url, cb ){
	if( typeof cb !== 'function')
		cb = console.log
	
	console.log('request for url:', url)
	
	request.get( url, function(err, req, body) {
		cb( err, JSON.parse(body) )
	})
}


GBAPI.prototype.platforms = function(cb, offset) {
	
	var url = this.buildUrl('platforms/', {
		field_list: 'id,name',
		offset: offset,
	})
	
	this.exec( url, cb )
};

GBAPI.prototype.gamesOfPlatform = function(platformId, cb, offset) {
	
	var url = this.buildUrl('games/', {
		platforms: platformId,
		field_list: 'id,name',
		offset: offset,
	})
	
	this.exec( url, cb )
};

GBAPI.prototype.game = function(gameId, cb) {
	
	var url = this.buildUrl('game/'+gameId+'/', {} )
	
	this.exec( url, cb )
};



module.exports = GBAPI
