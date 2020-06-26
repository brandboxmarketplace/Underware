let router = require('../lib/router.js');

let temp = router.emptyTemplate();

console.log(temp.convert("write('a'); ?>1<? write('b'); ?>2<? write('c');"));
