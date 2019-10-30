let url = require('url'),
    path = require('path'),
    fs = require('fs'),
    mimetypes = require(__dirname+"/mimetypes.js")


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
      res.end(fs.readFileSync(__dirname+'/..'+uri))
      return
    }

    console.log(req.method + ": " + req.headers.host + uri);

    for(let route of this.routes[req.method]){
      if(/:[-0-9a-zA-Z]+/.test(route.route)){
        let pat = /:([-0-9a-zA-Z]+)/g;
        let match = route.route.match(pat)
        let pat2 = route.route

        for(let para of match){
          pat2 = pat2.replace(para, "([-_0-9a-zA-Z\\.]+)")
        }

        let exe = new RegExp("^"+pat2+"$").exec(uri)
        if(exe !== null){
          req.paras = {}
          for(let i = 0; i < match.length;i++){
            req.paras[match[i].replace(/^:/,'')] = exe[i+1]
          }

          if(typeof route.handler === "string"){
            if(/[\?|#]/.test(route.handler)){
              //swap redirect
              let r = route.handler, code = 302
              if(route.handler.includes(',')) [r, code] = route.handler.split(',')
              for(let para of Object.keys(req.paras)){
                r = r.replace("$"+para, req.paras[para])
              }

              res.writeHead(parseInt(code), {'Location': r})
              res.end()
            }else {
              //swap
              let r = route.handler
              for(let para of Object.keys(req.paras)){
                r = r.replace("$"+para, req.paras[para])
              }
              this.serveStatic(req, res, r)
            }
          }else{
            route.handler(req, res)
          }
          return;
        }
      }else if(new RegExp("^"+route.route+"$").test(uri)){
        if(typeof route.handler === "string"){
          if(/^http/.test(route.handler)){
            //redirect
            let r = route.handler, code = 302
            if(route.handler.includes(',')) [r, code] = route.handler.split(',')

            res.writeHead(parseInt(code), {'Location': r})
            res.end()
          }else {
            this.serveStatic(req, res, route.handler)
          }
        }else{
          route.handler(req, res)
        }
        return;
      }
    }

    this.serveStatic(req, res, uri);
  }
  setRoute(method, route, handler){
    this.routes[method].push({route: route, handler: handler})
  }
  showError(res, status, message){
    res.writeHead(status)
    res.end(message)
  }
  serveStatic(req, res, uri){
    let host = req.headers.host;

    //disable directory loading
    if(/\/$/.test(uri)) uri += "index.html"

    let filename = path.join(__dirname+'/domains/'+host, uri)

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

module.exports = new Router();
