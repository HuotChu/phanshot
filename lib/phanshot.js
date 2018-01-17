const phantom = require( 'phantom' );
const fs = require( 'fs' );

var ps = {}; /* phanshot namespace */

ps.capture = ( config ) => {
    return new Promise( ( resolve, reject ) => {
        var instance;
        var image = 'image.png';
        var temp = 'temp.html';

        config = config || {};
        config.phantom = config.phantom || [ '--ignore-ssl-errors=yes', '--web-security=no' ];
        config.viewport = config.viewport || { width: 1536, height: 920 };
        config.isGoogleMap = config.isGoogleMap || false;
        
        var html = config.html = config.html || '';
        var selector = config.selector = config.selector || '';

        phantom.create( config.phantom )
               .then( ph => {
                   instance = ph;
                   return instance.createPage();
               } )
               .then( page => {
                   let openPage = data => {
                       page.open( data ).then( status => {
                           const renderPng = () => {
                               const genImg = () => {
                                   page.renderBase64( 'png' ).then( img => {
                                       let buffer = new Buffer( img, 'base64' );

                                       fs.writeFile( image, buffer, { encoding: null }, function ( err ) {
                                           if ( err ) {
                                               console.log( err );
                                               instance.exit();
                                               reject( err );
                                           }
                                           instance.exit();
                                           resolve( fs.createReadStream( image ) );
                                       } );
                                   });
                               };
                               
                               if ( config.isGoogleMap ) {
                                   page.on('onTilesLoaded', /*true, */genImg);
                                   page.evaluateJavaScript( 'function() { '
                                       + 'google.maps.event.addListenerOnce( google.maps.Map, \'tilesloaded\','
                                       + 'function () { Window.dispatchEvent(\'onTilesLoaded\'); } );'
                                       + ' }'
                                   );
                               } else {
                                   genImg();
                               }
                           };

                           if ( status === 'success' ) {
                               if ( selector ) {
                                   page.evaluate( function ( s ) {
                                       return document.querySelector( s ).getBoundingClientRect();
                                   }, selector )
                                       .then( function ( rect ) {
                                       page.property( 'clipRect', rect );
                                       renderPng();
                                   });
                               } else {
                                   renderPng();
                               }
                           } else {
                               setTimeout( () => {
                                   instance.exit();
                                   reject( status );
                               }, 1000 );
                           }
                       } );
                   };
                   page.property( 'viewportSize', config.viewport );

                   if ( html && html.length ) {
                       fs.writeFile( temp, html, 'utf8', ( err ) => {
                           if ( err ) {
                               console.log( err );
                               instance.exit();
                               reject( err );
                           }
                           openPage( temp );
                       } );
                   } else {
                       openPage( config.url || '404.html' );
                   }
               })
               .catch( err => {
                   console.log( err );
                   instance.exit();
                   reject( err );
               });
    } );
};

module.exports = ps;
