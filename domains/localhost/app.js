let root = __dirname.split('/').pop(2).join('/')
let router = require(root+'/lib/router.js')

router.get('/', (req, res)=>{
  res.writeHead(200, {'Content-Type':'text/html'});
  res.end('<h1>Nice Underware!</h1>');
})

// htaccess style
router.get('/hello','/world.html') // alias
router.get('/hello/:world','/hello.html?a=$world,302') // alias redirect
router.get('/out','https://out.hello.gg,302') // redirect
// default redirect: 302

/*
  Further routers via get, post, update, patch, delete, and put all depending on
  the expected method:

  router.get(route, [(req, res)|"string"])
  router.get(route/:parameters/:go/:here, (req, res)) =>
    req.paras = {
      parameters: <string>,
      go: <string>,
      here: <string>
    }

*/
