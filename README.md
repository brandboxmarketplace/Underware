# Underware
If you are anything like me you like to do everything yourself, and you want to get it done as fast as possible, as good as you can. I'm not a fan of libraries from experience they add too much overhead for only a few features. There is no way you are going to use every feature of any given library. That is where UnderWare comes in. Let's just say the vanilla Node.js web modules need some help. They are really only designed for a single page, or a RestAPI. I like using Node.js for my web server because I have complete control over it, and it makes sense to keep everything JavaScript. However, like I said if you are trying to build a complete web site, you don't really have that many options. I haven't really found anything that does exactly what I want without having to mix a lot of modules together, or worse being forced to install modules that I'm not even using.

After many attempts and frustration, I think I finally have what does do it for me. It doesn't require any additional modules to operate as intended, you will have to however still install the modules that you want for other things to operate (outside the scope of just the web server). Your results may vary, but the simple plug and play usability that is provided by UnderWare is very appealing. You don't actually need to type a single bit of code (server side) to get a web site up and running. That doesn't mean that you don't have the same extensibility. Out of the box any traffic, for any host, sent to the server will attempt to serve static files, but you can also route the traffic any way you like. Imagine for a second the simple server instance callback.

```JavaScript
(req, res) => {
  res.end("Hello World")
}
```

Instead of having a million if/else statements trying to figure out where the traffic is supposed to go, because that's all node.js gives you is this callback, why not have a callback for each destination? The file structure is set up in a way where a given host can be "hotswappable" and separate from each other. Meaning that this server supports multiple domains, just point each one at the server and create the directory no further configuration needed (with the exception of the app.js file if applicable). Again, I don't like using libraries, so it's kind of ironic that I'm sharing one, but I didn't want to keep it all to myself.

This server system is designed for the modern web and requires SSL. It would be better practice to use SSL anyway, as Google is soon to ban any website not holding a SSL Certificate. There are a number of ways to obtain a certificate, but the one I use is [LetsEncrypt](https://letsencrypt.org). This module is part of a set, and is strictly only responsible for handling traffic. The rest will be coming shortly and will be "pants". Each pair of pants will have their own purpose as to actually rendering a page with less code. Spoiler: "Shorts", "Jeans", and "Slacks" will be among the first.

The naming convention may be a little different, but it should make perfect sense. Underwear isn't what you want everyone to see, but they are lightweight and important. Your choice of pants is what everyone else sees, and each have their own purposes.

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

### Templating

I have added a new feature that brings html and node closer together. The api is very similar to php, but instead runs javascript in the NodeJS scope. Not intended for front-end use, but personally has sped up building pages that require server-side construction within Node. 

```HTML
<? //inline ?>
<? for(let i = 0;i < 10;i++){ ?><span><? write(i); ?></span><? } ?>
<!-- write(data); is how you "echo" data into the html the above will print 10 spans all with index -->
<? 
  //multi-line
  //notice the tags need to be on their own line I will change this later, but as of right now
?>
<include /path/to/nested/node.node>
```

When ever the router tries to serve a ".node" file it will automatically build the page. So in your "app.js" if you add:
```JavaScript
router.get("/alias","/real/path.node")
```
It will build the templated page without any further action. (Besides actually building the page which is just html and the above tags)
You can also simply link to the ".node" file from address bar it will still construct the page before the client gets it, but I personally would rather keep this extension hidden.
