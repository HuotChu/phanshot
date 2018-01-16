# phanshot
Easy to use server-side screenshot using Phantom and NodeJS

Install via [npm](https://www.npmjs.com):

```bash
npm install phanshot --save
```

## Getting Started
This is a **NEW** project; documentation is coming very soon!

## Sample JSON body sent with request
### Screenshot from URL
```javascript
{  
  "url":"https://google.com",
  "selector":"#hplogo",
  "phantom":[  
    "--ignore-ssl-errors=yes",
    "--web-security=no"
  ],
  "viewport":{  
    "width":"1536",
    "height":"920"
  }
}
```

### Screenshot from HTML
```javascript
{  
  "html":"<html><head></head><body style='background-color:#FFF'><div>This is a test</div><div style='width:200px;height:200px;background-color:#0000FF' id='blue'>&nbsp;</div></body></html>",
  "selector":"#blue",
  "phantom":[  
    "--ignore-ssl-errors=yes",
    "--web-security=no"
  ],
  "viewport":{  
    "width":"1536",
    "height":"920"
  }
}
```
