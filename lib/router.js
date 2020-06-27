let url = require('url'),
    path = require('path'),
    fs = require('fs'),
    mimetypes = require(__dirname+"/mimetypes.json")

let mod = this;

class Router {
  constructor(){
    this.routes = {
      "POST": [],
      "GET": [],
      "UPDATE": [],
      "PUT": [],
      "PATCH": [],
      "DELETE": []
    };
  }

  get(route, handler){
    this.setRoute("GET", route, handler)
  }
  post(route, handler){
    this.setRoute("POST", route, handler)
  }
  put(route, handler){
    this.setRoute("PUT", route, handler)
  }
  update(route, handler){
    this.setRoute("UPDATE", route, handler)
  }
  patch(route, handler){
    this.setRoute("PATCH", route, handler)
  }
  delete(route, handler){
    this.setRoute("DELETE", route, handler)
  }
  handle(req, res){
    let uri = url.parse(req.url).pathname;
    if(/app\.js/.test(uri)){
      res.writeHead(404, {'Content-Type':'text/plain'})
      res.end("Not Found")
      return
    }

    if(/\/fonts\//.test(uri)){
      let mimetype = mimetypes[path.extname(uri).split(".")[1]];
      if(mimetype === undefined) console.error("UNK: " + uri);
      res.writeHead(200, {'Content-Type': mimetype});
      res.end(fs.readFileSync(__root+uri))
      return
    }
    console.log(req.method + ": " + req.headers.host + uri);

    let found = false;
    for(let route of this.routes[req.method]){
      found = route.render(req, res)
      if(found) return;
    }

    this.serveStatic(req, res, uri);
  }
  setRoute(method, route, handler){
    //this.routes[method].push({route: route, handler: handler})
    let dest = new Destination(this, route, handler)
    this.routes[method].push(dest)
    return dest
  }
  showError(res, status, message){
    res.writeHead(status)
    res.end(message)
  }
  emptyTemplate(){
    return emptyTemp();
  }
  serveStatic(req, res, uri){
    let host = req.headers.host;

    //disable directory loading
    if(/\/$/.test(uri)) uri += "index.html"

    let filename = path.join(__domains+host, uri)

    if(/\.node$/.test(uri)){
      console.log(filename);
      handleTemplate(req, res, filename);
    }else{
      fs.open(filename, (err, fd)=>{
        if(err){
          console.log(err)
          switch(err.code){
            case "ECONNREFUSED":
              this.showError(res, 400, "Connection Refused")
              break;
            case "ENOENT":
              this.showError(res, 404, "Not Found")
              break;
            case "ETIMEDOUT":
              this.showError(res, 504, "Timed Out")
              break;
            case "EISDIR":
              this.showError(res, 400, "Bad Request")
              break;
            default:
              throw err;
          }
          return;
        }
        fs.fstat(fd, (err, stats)=>{
          if(err){
            switch(err.code){
              case "EACCES":
              case "EPERM":
                this.showError(res, 401, "Unauthorized")
            }
          }
          if(stats.isDirectory()){
            this.showError(res, 400, "Bad Request")
          }

          let mimetype = mimetypes[path.extname(filename).split(".")[1]];
          if(mimetype === undefined) console.log("UNK: " + filename);
          res.writeHead(200, {'Content-Type': mimetype});

          let bufferSize = stats.size,
              chunkSize = 1024,
              buffer = Buffer.allocUnsafe(bufferSize),
              bytesRead = 0
          while(bytesRead < bufferSize){
            if((chunkSize + bytesRead) > bufferSize) chunkSize = bufferSize - bytesRead
            fs.readSync(fd, buffer, bytesRead, chunkSize, bytesRead)
            bytesRead += chunkSize
          }
          fs.closeSync(fd)
          res.end(buffer)
        })
      })
    }
  }
}

class Destination {
  constructor(router, route, handler){
    this.router = router
    this.route = route
    this.handler = handler
  }
  render(req, res){
    let uri = url.parse(req.url).pathname;
    if(/:[-0-9a-zA-Z]+/.test(this.route)){
      let pat = /:([-0-9a-zA-Z]+)/g;
      let match = this.route.match(pat)
      let pat2 = this.route

      for(let para of match){
        pat2 = pat2.replace(para, "([-_0-9a-zA-Z\\.]+)")
      }

      let exe = new RegExp("^"+pat2+"$").exec(uri)
      if(exe !== null){
        req.paras = {}
        for(let i = 0; i < match.length;i++){
          req.paras[match[i].replace(/^:/,'')] = exe[i+1]
        }

        if(typeof this.handler === "string"){
          if(/[\?|#]/.test(this.handler)){
            //swap redirect
            let r = this.handler, code = 302
            if(this.handler.includes(',')) [r, code] = this.handler.split(',')
            for(let para of Object.keys(req.paras)){
              r = r.replace("$"+para, req.paras[para])
            }

            res.writeHead(parseInt(code), {'Location': r})
            res.end()
          }else {
            //swap
            let r = this.handler
            for(let para of Object.keys(req.paras)){
              r = r.replace("$"+para, req.paras[para])
            }
            this.router.serveStatic(req, res, r)
          }
        }else{
          this.handler(req, res)
        }
        return true;
      }
    }else if(new RegExp("^"+this.route+"$").test(uri)){
      if(typeof this.handler === "string"){
        if(/^http/.test(this.handler)){
          //redirect
          let r = this.handler, code = 302
          if(this.handler.includes(',')) [r, code] = this.handler.split(',')

          res.writeHead(parseInt(code), {'Location': r})
          res.end()
        }else {
          this.router.serveStatic(req, res, this.handler)
        }
      }else{
        this.handler(req, res)
      }
      return true;
    }
    return false;
  }

  get router(){
    return this.router
  }
  get route(){
    return this.route
  }
  get handler(){
    return this.handler
  }

  router(r){
    this.router = r
  }
  route(r){
    this.route = r
  }
  handler(h){
    this.handler = h
  }
}

class Template{
  constructor(req, res){
    this.pattern = /<\? (.*?) \?>/;
    this.close_pat = /(.*?) ?\?>/;
    this.open_pat = /<\? ?(.*)/;
    this.inv_pat = /^(.*?) ?\?>(.*?)<\? ?(.*)$/;
    this.inc_pat = /<include (.*?)>/;
    this.delimeter = "[---]";
    this.req = req;
    this.res = res;
  }
  load(uri){
    let data = fs.readFileSync(uri).toString();
    return this.convert(data);
  }
  // handle data
  convert(data){
    // get lines
    let lines = data.split('\r\n');
    let open = false;
    let doc = "";

    for(let line of lines){
      let node = [];
      let html = [];
      line = line.trim();

      if(this.pattern.test(line)){
        let match;
        while(match = this.pattern.exec(line)){
          node.push(match[1])
          line = line.replace(match[0], this.delimeter);
        }
        if(this.close_pat.test(line)){
          match = this.close_pat.exec(line);
          node.unshift(match[1]);
          line = line.replace(match[0], this.delimeter);
        }
        if(this.open_pat.test(line)){
          match = this.open_pat.exec(line);
          node.push(match[1]);
          line = line.replace(match[0], this.delimeter);
        }
        html = line.split(this.delimeter);
        for(let i = 0;i < html.length;i++){
          doc = this.append(doc, this.escape(html[i]));
          if(i != html.length-1) doc = this.append(doc, node[i]);
        }
      }else if(this.inv_pat.test(line)){
        let match = this.inv_pat.exec(line);
        node.push(match[1]);
        html.push(match[2]);
        node.push(match[3]);
        for(let i = 0;i < node.length;i++){
          doc = this.append(doc, node[i]);
          if(i != node.length-1) doc = this.append(doc, this.escape(html[i]));
        }
      }else if(this.open_pat.test(line)){
        let match = this.open_pat.exec(line);
        node.push(match[1]);
        line = line.replace(match[0], this.delimeter);
        html = line.split(this.delimeter);
        if(html[0] == ""){
          html.shift();
          html.push("");
        }
        for(let i = 0;i < html.length;i++){
          doc = this.append(doc, this.escape(html[i]));
          if(i != html.length-1) doc = this.append(doc, node[i]);
        }
        open = true;
      }else if(this.close_pat.test(line)){
        let match = this.close_pat.exec(line);
        node.push(match[1]);
        line = line.replace(match[0], this.delimeter);
        html = line.split(this.delimeter);
        if(html[0] == ""){
          html.shift();
          html.push("");
        }
        for(let i = 0;i < html.length;i++){
          doc = this.append(doc, this.escape(html[i]));
          if(i != html.length-1) doc = this.append(doc, node[i]);
        }
        open = false;
      }else{
        // full lines
        if(open){
          if(/include\('(.*)'\);?/.test(line)){
            let match = /include\('(.*)'\);?/.exec(line);
            doc = this.include(doc, match[1]);
          }else doc = this.append(doc, line);
        }else if(this.inc_pat.test(line)){
          let match = this.inc_pat.exec(line);
          doc = this.include(doc, match[1]);
        }else{
          doc = this.append(doc, this.escape(line));
        }
      }
    }
    return doc;
  }
  // recursion root
  build(uri){
    let trunk = this.load(uri);
    return trunk;
  }
  // consistency helper
  append(doc, data){
    if(data == "") return doc;
    doc += data + "\r\n";
    return doc;
  }
  // consistency helper
  escape(html){
    if(html == "") return '';
    let out = ('' + html).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;').replace(/\//g,'&#x2F;');
    return "write('"+out+"');";
  }
  // consistency helper
  unescape(text){
    return ('' + text).replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#x27;/g,"'").replace(/&#x2F;/g,'/');
  }
  // consistency helper
  include(doc, uri){
    doc += this.load(__domains+this.req.headers.host+uri.replace(/^\./,''));
    return doc;
  }
  // consistency helper
  write(data){
    this.res.write(this.unescape(data));
  }
  end(){
    this.res.end();
  }
}

// workaround for having to choose between output or node access
function handleTemplate(req, res, uri){
  module.exports.t = new Template(req, res);
  let out = module.exports.t.build(uri);
  eval("(async ()=>{"+out+"function write(data){module.exports.t.write(data);}module.exports.t.end();})()");
}

function emptyTemp(){
  return new Template(null,null);
}

module.exports = new Router();
