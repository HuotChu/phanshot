const phantom = require( 'phantom' );
const path = require( 'path' );
const fs = require( 'fs' );

var ps = {}; /* phanshot namespace */

ps.capture = ( source, config ) => {
    var instance;
    var image = path.join( __dirname, 'image.png' );
    var temp = path.join( __dirname, 'temp.html' );
    
    config = config || { selector: '' };
    config.phantom = config.phantom || [ '--ignore-ssl-errors=yes', '--web-security=no' ];
    config.viewport = config.viewport || { width: 1536, height: 920 };
    //sourceType = config.sourceType || 'url';

    phantom.create( config.phantom )
           .then( ph => instance = ph && instance.createPage() )
           .then( page => {
               page.property( 'viewportSize', config.viewport );
               page.open( source ).then( status => {
                   if ( status === 'success' ) {
                       let wait = false;

                       if ( config.selector ) {
                           wait = true;
                           page.evaluate( function () {
                               document.querySelector( config.selector ).getBoundingClientRect();
                           }).then( function ( rect ) {
                               page.property( 'clipRect', rect );
                               wait = false;
                           } );
                       }

                       while ( wait ) {
                           setTimeout( () => {}, 1000 );
                       }

                       page.renderBase64( 'png' ).then( img => {
                           var buffer = new Buffer( img, 'base64' );

                           fs.writeFile( image, buffer, { encoding: null }, function ( err ) {
                               if ( err ) {
                                   console.log( err );
                                   instance.exit();
                                   
                                   return err;
                               }
                               instance.exit();
                               
                               return fs.createReadStream( image );
                           } );
                       });
                   } else {
                       setTimeout( () => {
                           instance.exit();
                           return status;
                       }, 1000 );
                   }
               } );
           })
           .catch( err => {
               console.log( err );
               instance.exit();
               
               return( err );
           });
};

module.exports = ps;

