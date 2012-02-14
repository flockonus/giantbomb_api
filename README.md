# GiantBomb API Explorer

Made for node.js

## Install

<pre>
  npm install giantbomb-api
</pre>

## Demonstration

```javascript
GBAPI = require('./main.js'); gb = new GBAPI('your-api-token', 3);

// now, start making some requests to see how it works!

gb.platforms()                   // list first 3 platforms
gb.gamesOfPlatform( 36 )          // list first 3 Wii games
gb.game( 67, function(err, resp){  // tiger woods
	console.log( resp.results.name, '-', resp.results.original_release_date )
})
```

## Extending

It is easy to extend the API acces by using the methods `buildtUrl` and `exec`

Upon creating useful methods you may send me a pull request or post it in a gist and point it at Issues

## Docs

See https://github.com/flockonus/giantbomb_api/blob/master/main.js