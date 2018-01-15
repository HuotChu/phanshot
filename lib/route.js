const { capture } = require( './phanshot' );
const router = require( 'express' ).Router();

const handleError = ( res, error ) => {
    res.json({
        status: 'Error',
        description: error
    });
};

router.all( '/', ( req, res ) => {
    let query = req.query;
    let url = query.url;
    let config = {
        dataType: 'url',
        s: query.s || ''
    };
    let body = [];

    console.log( query );

    if ( url ) {
        capture( url, config )
            .then( img => {
                img.pipe( res );
            } )
            .catch(err => {
                handleError( res, err );
            });
    } else {
        req.on('error', err => {
            handleError( res, err );
        }).on('data', chunk => {
            body.push( chunk );
        }).on('end', () => {
            body = Buffer.concat( body ).toString();
            config.dataType = 'html';
            capture( body, config )
                .then( img => {
                    img.pipe( res );
                } )
                .catch( err => {
                    handleError( res, err );
                } );
        });
    }
} );

module.exports = router;
