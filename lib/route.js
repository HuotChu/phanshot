const { capture } = require( './phanshot' );
const router = require( 'express' ).Router();

const handleError = ( res, error ) => {
    res.json({
        status: 'Error',
        description: error
    });
};

router.all( '/', ( req, res ) => {
    let config = [];
    
    req.on('error', err => {
        handleError( res, err );
    }).on('data', chunk => {
        config.push( chunk );
    }).on('end', () => {
        config = Buffer.concat( config );
        config = JSON.parse( config.toString() );
        capture( config )
            .then( img => {
                img.pipe( res );
            } )
            .catch( err => {
                handleError( res, err );
            } );
    });
} );

module.exports = router;
