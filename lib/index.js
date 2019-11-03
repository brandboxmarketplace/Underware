var https = require('https'),
    http = require('http'),
    fs = require('fs'),
    util = require('util'),
    config = require('../config')

//https server
var server = https.createServer(
  {
    cert: fs.readFileSync(config.cert),
    key: fs.readFileSync(config.key)
  },
  (req, res)=>{
    let host = req.headers.host;

    if(fs.existsSync(__domains+host+'/')){
      let handler;
      if(fs.existsSync(__domains+host+'/app.js')){
        handler = require(__domains+host+'/app.js');
      }else{
        handler = require(__dirname+'/router.js');
      }
      handler.handle(req, res);
    }else{
      res.writeHead(404);
      res.end("404: "+host+" does not exist.");
    }
  }
).listen(443, config.ip);

//http redirect
let unsecure = http.createServer((req, res)=>{
  res.writeHead(307, {
    'Location': 'https://'+req.headers['host'] + req.url
  });
  res.end();
}).listen(80, config.ip);

//watchdog for changes to system
let domains = fs.readdirSync(__domains);
for(let i in domains){
  fs.watchFile(__domains+domains[i]+'/app.js', (curr, prev)=>{
    console.log("File Changed: "+domains[i]);
    delete require.cache[__domains+domains[i]+'/app.js']
    //delete require.cache[__dirname+"/router.js"]
  })
}

fs.watch(__domains, (eventType, filename)=>{
  if(eventType == "rename"){
    console.log("Domain added: "+filename);
    while(!fs.existsSync(__domains+filename+'/app.js')){
      if(fs.existsSync(__domains+filename+'/app.js')){
        fs.watchFile(__domains+filename+'/app.js', (curr, prev)=>{
          console.log("File Changed: "+filename);
          delete require.cache[__domains+filename+'/app.js']
        })
      }
    }
  }
})
