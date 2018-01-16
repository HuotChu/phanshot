# phanshot
Easy to use server-side screenshot using Phantom and NodeJS

Install via [npm](https://www.npmjs.com):

```bash
npm install phanshot --save
```

## Getting Started
There are 2 ways to use phanshot within your application:

### Method 1
Use the built-in router to handle requests and responses.

- In your app entry file (index.js,  app.js, etc.) require **Express** and the phanshot router.
  ```javascript
    const express = require( 'express' );
    const app = express();
    
    const { route } = require( 'phanshot' );
    ```
- Map the router to the name you want on the request URL. The following example creates the route `webserver.com/screenshot` to handle all screenshot requests.
    ```javascript
    app.use( '/screenshot', route );
    ```
- Pass a URL on the query string to request a screenshot of that website.
    ```bash
    http://127.0.0.1:3000/screenshot?url=https://google.com
    ```
- CSS selectors can be used to request a specific part of the page. The following example returns a .png of the Google logo image only. *: Note the # symbol and other symbols used in selectors must be url encoded as show below.
    ```bash
    http://127.0.0.1:3000/screenshot?url=https://google.com&s=%23hplogo
    ```
- You can also send a string of HTML on the body of your request rather than a URL. The query string params still work!

### Method 2
Call phanshot's **capture** method directly from anywhere in your app.

- Require the `phanshot` object.
    ```javascript
    const { phanshot } = require( 'phanshot' );
    ```
- Call the `capture` method with a URL or HTML, plus the optional config object.
  ```javascript
  phanshot.capture( 'https://google.com', { s: '#hplogo' } )
          .then( img => {
              // img is a readable, base-64 encoded stream
          } )
          .catch( err => {
              // handle errors
          } );
  ```
