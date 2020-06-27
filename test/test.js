global.__domains = __dirname;
let router = require('../lib/router.js');

let req = {
  headers: {
    host: "/"
  }
}
let temp = router.emptyTemplate(req);

var assert = require('assert');

// inline-tag
assert.strictEqual(temp.convert("<span><? //hello ?></span>"), "write('&lt;span&gt;');\r\n//hello\r\nwrite('&lt;&#x2F;span&gt;');\r\n")

// multi-line (own line)
assert.strictEqual(temp.convert("<?\r\n//hello\r\n?>"),"//hello\r\n");

// multi-line
assert.strictEqual(temp.convert("a<?\r\n//hello\r\n?>b"),"write('a');\r\n//hello\r\nwrite('b');\r\n");

// close/open
assert.strictEqual(temp.convert("write('a'); ?>hello<? write('b');"), "write('a');\r\nwrite('hello');\r\nwrite('b');\r\n");

// close/open w/ inline
assert.strictEqual(temp.convert("write('a'); ?>1<? write('b'); ?>2<? write('c');"), "write('a');\r\nwrite('1');\r\nwrite('b');\r\nwrite('2');\r\nwrite('c');\r\n");

// inline w/open
assert.strictEqual(temp.convert("<? write('a'); ?>1<? write('b');"), "write('a');\r\nwrite('1');\r\nwrite('b');\r\n");

// close w/ inline
assert.strictEqual(temp.convert("write('a');?>1<? write('b'); ?>"), "write('a');\r\nwrite('1');\r\nwrite('b');\r\n");

// include tag
assert.strictEqual(temp.convert("<include a.node>"), "write('hello');\r\n");

// include function
assert.strictEqual(temp.convert("<?\r\ninclude('a.node');\r\n?>"), "write('hello');\r\n");
