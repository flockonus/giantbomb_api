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

gb.platforms() // list first 3 platforms

gb.gamesOfPlatform( 36 ) // list first 3 Wii games

gb.game( 67, function(err, resp){ console.log( resp.results.name, '-', resp.results.original_release_date ) } ) // tiger woods
```

## Extending

The API is really easy to extend by calling methods `buildtUrl` and `exec`

Upon creating useful methods you may send me a pull request or post it in a gist.