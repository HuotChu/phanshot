const phantom = require( 'phantom' );
const path = require( 'path' );
const fs = require( 'fs' );

/* html paths */
const temp = path.join( __dirname + '\\temp.html' );
const framed = path.join( __dirname + '\\iframe.html' );

/* phanshot namespace */
let ps = {};

/* holds the current phantom instance */
let instance = undefined;

/* creates a new phantom instance; returns the page object */
ps.create = config => {
    return new Promise( ( resolve, reject ) => {
        phantom.create( config.phantom )
               .then( ph => {
                   instance = ph;
                   return instance.createPage();
               } )
               .then( page => {
                   page.property( 'viewportSize', config.viewport );
                   resolve( page );
               } )
               .catch( err => ps.exit( err, reject ) );
    } );
};

/* gets the coordinates and size to the bounding box of an element */
ps.getBoundingBox = ( page, selector ) => {
    return new Promise( ( resolve, reject ) => {
        if ( !selector ) {
            resolve( [ page, false ] );
        } else {
            page.evaluate( function ( s ) {
                var elm = document.querySelector( s );
                return elm ? elm.getBoundingClientRect() : false;
            }, selector )
                .then( rect => resolve( [ page, rect ] ) )
                .catch( err => ps.exit( err, reject ) );
        }
    } );
};

/* load a document into the phantom page */
ps.open = ( page, url ) => {
    return new Promise( ( resolve, reject ) => {
        page.open( url.replace( /(^[a-z]:)/i, 'file:///$1' ) )
            .then( status => {
                if ( status === 'success' ) {
                    resolve( page );
                } else {
                    reject( 'Tried to open ' + data + '  Status: ' + status );
                }
            } )
            .catch( err => ps.exit( err, reject ) );
    } );
};

/* close phantom instance leaving time for running processes to complete */
ps.exit = ( err, reject ) => {
    if ( err ) {
        reject( err );
    }
    setTimeout( function () {
        return instance && instance.exit();
    }, 1000 );
};

/* render .png image from phantom page object */
ps.render = page => {
    return new Promise( ( resolve, reject ) => {
        let image = path.join( __dirname + '\\image.png' );
        page.renderBase64( 'png' )
            .then( function ( img ) {
                let buffer = new Buffer( img, 'base64' );
                fs.writeFile( image, buffer, { encoding: null }, function ( err ) {
                    if ( err ) {
                        ps.exit( err, reject );
                    }
                    resolve( fs.createReadStream( image ) );
                } );
            } )
            .catch( err => ps.exit( err, reject ) );
    });
};

ps.capture = ( config ) => {
    return new Promise( ( resolve, reject ) => {
        config = config || {};
        config.phantom = config.phantom || [ '--ignore-ssl-errors=yes', '--web-security=no' ];
        config.rect = config.rect || false;
        config.viewport = config.viewport || { width: 1366, height: 768 };
        config.wait = config.wait || 7000;
        config.useFrame = config.useFrame || false;

        let url = config.url || false;
        let html = config.html || false;
        let selector = config.selector || false;

        if ( url && config.useFrame ) {
            /* iframe loader */
            ps.create( config )
              .then( page => ps.open( page, framed ) )
              .then( page => {
                  /* debug */
                  page.on( 'onCallback', function ( info ) {
                      console.log( info );
                  } );

                  page.evaluate( function ( uri ) {
                      document.getElementById( 'pageFrame' ).src = uri;
                  }, config.url );

                  /* wait {$config.wait} milliseconds for the iframe content to load */
                  setTimeout( () => {
                      page.evaluate( function ( s ) {
                          var el = document.frameBody.querySelector( s );
                          return el && el.getBoundingClientRect && el.getBoundingClientRect();
                      }, selector )
                          .then( rect => {
                              if ( rect && rect.width ) {
                                  page.property( 'clipRect', rect );
                              }
                              resolve( ps.render( page ) );
                              ps.exit();
                          } )
                          .catch( err => ps.exit( err, reject ) );
                  }, config.wait );
              } )
              .catch( err => ps.exit( err, reject ) );
        } else if ( url ) {
            /* url load */
            ps.create( config )
              .then( page => ps.open( page, url ) )
              .then( page => {
                  return new Promise( resolve => {
                      setTimeout( () => {
                          resolve( config.rect ? [ page, config.rect ] : ps.getBoundingBox( page, selector ) );
                      }, config.wait );
                  } );
              } )
              .then( ( [ page, rect ] ) => {
                  if ( rect ) {
                      page.property( 'clipRect', rect );
                  }
                  resolve( ps.render( page ) );
                  ps.exit();
              } )
              .catch( err => ps.exit( err, reject ) );
        } else if ( html ) {
            fs.writeFile( temp, html, 'utf8', ( err ) => {
                if ( err ) {
                    ps.exit( err, reject );
                } else {
                    /* html load */
                    ps.create( config )
                      .then( page => ps.open( page, temp ) )
                      .then( page => {
                          return config.rect ? [ page, config.rect ] : ps.getBoundingBox( page, selector );
                      } )
                      .then( ( [ page, rect ] ) => {
                          if ( rect ) {
                              page.property( 'clipRect', rect );
                          }
                          resolve( ps.render( page ) );
                          ps.exit();
                      } )
                      .catch( err => ps.exit( err, reject ) );
                }
            } );
        } else {
            reject( 'Malformed config.' );
        }
    } );
};

module.exports = ps;
