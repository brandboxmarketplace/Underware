# Underware
If you are anything like me you like to do everything yourself, and you want to
get it done as fast as possible, as good as you can. I'm not a fan of libraries
from experience they add too much overhead for only a few features. There is no
way you are going to use every feature of any given library. That is where UnderWare
comes in. Let's just say the vanilla Node.js web modules need some help. They are
really only designed for a single page, or a RestAPI. I like using Node.js for my
web server because I have complete control over it, and it makes sense to keep
everything JavaScript. However, like I said if you are trying to build a complete
web site, your options used to be ExpressJS and wait no Express was really the only
option. I have used Express, and not to bash, but it just didn't do it for me.

After many attempts and frustration, I think I finally have what does do it for
me. Your results may vary, but the simple plug and play usability that is provided
by UnderWare is very appealing. You don't actually need to type a single bit of
code (server side) to get a web site up and running. That doesn't mean that you
don't have the same extensibility. Out of the box any traffic, for any host, sent
to the server will attempt to serve static files, but you can also route the
traffic any way you like. Imagine for a second the simple server instance callback.

```JavaScript
(req, res) => {
  res.end("Hello World")
}
```

Instead of having a million if/else statements trying to figure out where the traffic
is supposed to go, because that's all node.js gives you is this callback, why not
have a callback for each destination? The file structure is set up in a way where
a given host can be "hotswappable" and separate from each other. Meaning that
this server supports multiple domains, just point each one at the server and
create the directory no further configuration needed (with the exception of the
app.js file if applicable).

This server system is designed for the modern web and requires SSL. It would be
better practice to use SSL anyway, as Google is soon to ban any website not holding
a SSL Certificate. There are a number of ways to obtain a certificate, but the
one I use is LetsEncrypt.

### Setup

1. Install node.js

2. Download the repository

3. Move the directory (or copy the contents to destination)

4. Start the Server
```
cd /path/to/server
sudo node .
```

### Examples

### License

(The MIT License)

Copyright (c) 2019 Parmleyhunt Designs https://parmleyhunt.com

Copyright (c) 2019 Hunter Parmley parmleyhunt@gmail.com

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
