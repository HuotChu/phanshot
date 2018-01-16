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
        
        var html = config.html = config.html || '';
        var selector = config.selector = config.selector || '';

        phantom.create( config.phantom )
               .then( ph => {
                   instance = ph;
                   return instance.createPage();
               } )
               .then( page => {
                   var openPage = data => {
                       page.open( data ).then( status => {
                           var renderPng = () => {
                               page.renderBase64( 'png' ).then( img => {
                                   var buffer = new Buffer( img, 'base64' );

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

                           if ( status === 'success' ) {
                               if ( selector ) {
                                   var r = page.evaluate( function () {
                                       return document.querySelector( selector ).getBoundingClientRect();
                                   } );

                                   r.then( function ( rect ) {
                                       page.property( 'clipRect', rect );
                                       console.log( rect );
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
