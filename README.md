# Underware
[Wiki](https://github.com/parmleyhunt/Underware/wiki)

I really don't like callbacks and the fact that NodeJS only gives you one per server, this made me think. What if you could have one server, but have a call back for each domain? Well I did it and it's awesome. This workflow works a lot better than I could've imagined. I made it work a lot like a Apache/PHP workflow. The [app.js](https://github.com/parmleyhunt/Underware/wiki#appjs) works a lot like a .htaccess. The nodes are based off inline-php, but can do things traditional php just can't.

I made it very lightweight and unintrusive, mainly meaning that migration to and from Underware is just a cut/paste. Out of the box it will try to serve static files, this can be altered via the app.js. Each domain is essentially it's own zone. One domain can't break into another, with the exception of the shared directory. All paths and files only exist for each domain.

This server system is designed for the modern web and requires SSL. It would be better practice to use SSL anyway, as Google is soon to ban any website not holding a SSL Certificate. There are a number of ways to obtain a certificate, but the one I use is [LetsEncrypt](https://letsencrypt.org).

The naming convention may be a little different, but it should make perfect sense. Underwear is the base layer, and your pants only function, more protection, or style.

### Boxers (0.0.5) in-dev
With the addition of nodes (in 0.0.4) there is not a need for custom routing in the app.js. This started making me think about how I can make managing the server itself easier. Following the trend for headless containers, I've decided to start working on a web-gui to manage Users/Groups, Routes, Configuration, and dependencies. This new update is going to be a big one so I thought that this would be a better option than a cli approach (although this could still be an option). The web-gui would exclusively be available, because of how Underware resolves the destination. If you were to access the local ip vs. the domain they will resolve differently. Making the web-gui only available to management. I could have very well just put it on a seperate port, but that would require an additional server instance running. Plus I haven't and don't plan on having port routing incorporated.

### Setup

1. Install node.js
2. Download the repository
3. Move the directory (or copy the contents to destination)
4. Edit the config.json file with your values
5. Start the Server
```
cd /path/to/server
sudo node .
```
6. Add a folder for each destination in the /domains directory (eg. sub.domain.com)

If you plan on having routes:

7. In each folder added create an **app.js**
8. Add the following to the top:
```JavaScript
let router = module.exports = require(__lib+'/router.js')
```
9. Add routes
```JavaScript
router.get("/",(req, res)=>{
  // custom rendering
})
```

For an example look at the **localhost** folder in /domains.

### Nodes

In Briefs(0.0.4), I added a templating add-on feature that allowed you to inject server-side javascript into html pages, and manipulate the page like php used to do. After using this feature for a bit I've decided to make it a fundamental feature. The code required is very lightweight, and doesn't consume anymore performance than constructing html from javascript. Having access to the Request/Response objects completely removes the need for a callback all together, however you can still do it this way for Rest-Api or similar. It has sped up the development of data intensive pages in my own projects. It will change the way you think about NodeJS, hence the extension, it truely brings out the power of server-side javascript.

> You must preface async functions with await.

```HTML
<? //inline ?>
<? for(let i = 0;i < 10;i++){ ?><span><? write(i); ?></span><? } ?>
<!-- write(data); is how you "echo" data into the html the above will print 10 spans all with index -->
<? 
  //multi-line
?>
<include /path/to/nested/node.node>
```

When ever the router tries to serve a ".node" file (from url request or app.js) it will automatically build the page. So in your "app.js" if you add:
```JavaScript
router.get("/alias","/real/path.node")
```
or you goto ```https://example.com/real/path.node``` it will render the same page.
