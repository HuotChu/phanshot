# phanshot
Easy to use server-side screenshot using Phantom and NodeJS

Capture dynamic content such as a Google Map or an entire web page. phanshot will turn any url or string of html into a screenshot. Pass an optional selector to capture only a specific portion of the page. Several configuration parameters are available to customize how screenshots are taken, however logical defaults are provided for easy implementation of common use cases. 

Install via [npm](https://www.npmjs.com):

```bash
npm install phanshot --save
```

## Current Development (*coming soon*)
-  Detect when DOM element is loaded within iframe to reduce latency
-  Support for offsets passed in as params

## Latest Version
1.2.0 is a complete refactor of phanshot. Improved stability, optional iframe loader support, configurable wait time, and more exposed methods for hackers needing additional flexibility.

## Getting Started
This is a **NEW** project; *more* documentation is coming soon.

### Using the phanshot router
If you are using Express for your routes, then simply include the phanshot router in your app start file (usually app.js or index.js)
```javascript
const app = express();
const { route } = require('phanshot');

app.use( '/screenshot', route );
```

### Don't need phanshot router? phanshot direct...
```javascript
const { phanshot } = require('phanshot');

let base64stream = phanshot.capture({/*config*/});

/* returns a promise... */
base64stream.then( img => {
    // do something with img stream; such as pipe to the response
    img.pipe( res );
} );
```

### config
When calling phanshot, you pass it a JSON config.
Only one of `url` or `html` are required, all other fields are optional.

```javascript
/* Sample config => screenshot of entire google homepage */
{
  url: "https://google.com"
}
```

```javascript
/* Sample config => screenshot from html */
{
  "html":"<html><head></head><body style='background-color:#FFF'><div>This is a test</div><div style='width:200px;height:200px;background-color:#0000FF' id='blue'>&nbsp;</div></body></html>"
}
```

In the case where you only want to capture a section of a page, a **selector** can be added to the config to identify the container element.

For example, to capture only the map contained in the `#map` div shown on https://hpneo.github.io/gmaps/examples/overlays.html

```javascript
{  
  "url": "https://hpneo.github.io/gmaps/examples/overlays.html",
  "selector": "#map"
}
```

Be careful to target the correct element! The map shown in the next example is loaded within an iframe, making the `#googft-mapCanvas` element unreachable. Correctly passing the iframe id `#preview` will capture the map.

```javascript
{  
  "url": "http://harrywood.co.uk/maps/examples/google-maps/add-osm-credits.view.html",
  "selector": "#preview"
}
```

The complete list of config options and their defaults:
```javascript
{  
  "url": false,
  "html": false,
  "selector": false,
  "rect": false, /* entire viewport */
  "viewport": { "width": 1366, "height": 768 },
  "useFrame": false,
  "wait": 9000,
  "phantom": [ "--ignore-ssl-errors=yes", "--web-security=no" ]
}
```

- **url** - web address to capture as a screenshot
- **html** - string of html to render as an image; css is supported
- **selector** - valid querySelector (css selector) of an element to capture
- **rect** - object with dimensions to create a bounding box for the screenshot
- **viewport** - size of the phantom viewport (browser)
- **useFrame** - render the target page in an iframe before rendering to image
- **wait** - milliseconds to let target page load before rendering to image
- **phantom** - phantom specific options

## Example JSON body (config) sent in a request to phanshot
### Screenshot from URL of just the Google logo
```javascript
{  
  "url":"https://google.com",
  "selector":"#hplogo"
}
```

### Screenshot from HTML: just the blue box
```javascript
{  
  "html":"<html><head></head><body style='background-color:#FFF'><div>This is a test</div><div style='width:200px;height:200px;background-color:#0000FF' id='blue'>&nbsp;</div></body></html>",
  "selector":"#blue"
}
```
