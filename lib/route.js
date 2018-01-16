const { capture } = require( './phanshot' );
const router = require( 'express' ).Router();

const handleError = ( res, error ) => {
    res.json({
        status: 'Error',
        description: error
    });
};

router.all( '/', ( req, res ) => {
    capture( req.body )
        .then( img => {
            img.pipe( res );
        } )
        .catch( err => {
            handleError( res, err );
        } );
} );

module.exports = router;
