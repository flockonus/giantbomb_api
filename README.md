# GiantBomb API Explorer

Made for node.js (that was 4y ago)

## Install

<pre>
  npm install giantbomb-api
</pre>

## Demonstration

```javascript
var GBAPI = require('./main.js');

var apiToken = 'your-api-token'; //required!
var responseLimit = 3; //defaults to a 100, but 3 is goot to test
var cacheHours = 0; //defaults to 0 as disabled

var gb = new GBAPI(apiToken, responseLimit, cacheHours);

// now, start making some requests to see how it works!

gb.platforms(console.log)                   // list first 3 platforms
gb.gamesOfPlatform( 36, console.log )          // list first 3 Wii games
gb.game( 67, function(err, resp){  // tiger woods
	console.log( resp.results.name, '-', resp.results.original_release_date )
})
```

## Extending

It is easy to extend the API acces by using the methods `buildtUrl` and `exec`

Upon creating useful methods you may send me a pull request or post it in a gist and point it at Issues

## Docs

See https://github.com/flockonus/giantbomb_api/blob/master/main.js

## Contributors

- @flockonus
- @Ronald-Diemicke
