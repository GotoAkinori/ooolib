var express = require( "express" );
var app = express();

var server = app.listen( 3000, function () {
    console.log( "[Node.js] listening..." );
    console.log( "port:" + server.address().port );
} );

app.use( "/ooo", express.static( __dirname + "/.." ) );