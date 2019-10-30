let root = __dirname.split('/').pop(2).join('/')
let router = require(root+'/lib/router.js')

router.get('/', (req, res)=>{
  res.writeHead(200, {'Content-Type':'text/html'});
  res.end('<h1>Nice Underware!</h1>');
})

/*
  Further routers via get, post, update, patch, delete, and put all depending on
  the expected method:

  router.get(route, (req, res))
  router.get(route/:parameters/:go/:here, (req, res)) =>
    req.paras = {
      parameters: <string>,
      go: <string>,
      here: <string>
    }

*/
