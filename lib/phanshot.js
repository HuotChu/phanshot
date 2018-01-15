const phantom = require( 'phantom' );
const path = require( 'path' );
const fs = require( 'fs' );

var ps = {}; /* phanshot namespace */

ps.capture = ( source, config ) => {
    return new Promise( (resolve, reject) => {
        var instance;
        var image = path.join( __dirname, 'image.png' );
        var temp = path.join( __dirname, 'temp.html' );

        config = config || { id: '' };
        config.phantom = config.phantom || [ '--ignore-ssl-errors=yes', '--web-security=no' ];
        config.viewport = config.viewport || { width: 1536, height: 920 };
        //sourceType = config.sourceType || 'url';

        phantom.create( config.phantom )
               .then( ph => {
                   instance = ph;
                   return instance.createPage();
               } )
               .then( page => {
                   page.property( 'viewportSize', config.viewport );
                   page.open( source ).then( status => {
                       var renderPng = () => {
                           page.renderBase64( 'png' ).then( img => {
                               var buffer = new Buffer( img, 'base64' );

                               fs.writeFile( image, buffer, { encoding: null }, function ( err ) {
                                   if ( err ) {
                                       console.log( err );
                                       instance.exit();

                                       return err;
                                   }
                                   instance.exit();
                                   resolve( fs.createReadStream( image ) );
                               } );
                           });
                       };

                       if ( status === 'success' ) {
                           if ( config.id ) {
                               var r = page.evaluate( function ( id ) {
                                   return document.getElementById( id ).getBoundingClientRect();
                               }, config.id);

                               r.then( function ( rect ) {
                                   page.property( 'clipRect', rect );
                                   console.log('rect', rect);
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
               })
               .catch( err => {
                   console.log( err );
                   instance.exit();
                   reject( err );
               });
    } );
};

module.exports = ps;
