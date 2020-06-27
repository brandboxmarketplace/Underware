let router = require('../lib/router.js');

let temp = router.emptyTemplate();

var assert = require('assert');
describe('Tests', function () {
  describe('Templating', function () {
    it('inline-tag', function () {
      assert.equal(temp.convert("<span><? //hello ?></span>"), "write('&lt;span&gt;');\r\n//hello\r\nwrite('&lt;&#x2F;span&gt;');\r\n")
    });
    it('multi-line (own line)', function(){
      assert.equal(temp.convert("<?\r\n//hello\r\n?>"),"//hello\r\n");
    })
    it('multi-line', function(){
      assert.equal(temp.convert("a<?\r\n//hello\r\n?>b"),"write('a');\r\n//hello\r\nwrite('b');\r\n");
    })
    it('close/open', function(){
      assert.equal(temp.convert("write('a'); ?>hello<? write('b');"), "write('a');\r\nwrite('hello');\r\nwrite('b');\r\n");
    })
    it('close/open w/ inline', function(){
      assert.equal(temp.convert("write('a'); ?>1<? write('b'); ?>2<? write('c');"), "write('a');\r\nwrite('1');\r\nwrite('b');\r\nwrite('2');\r\nwrite('c');\r\n");
    })
    it('inline w/ open', function(){
      assert.equal(temp.convert("<? write('a'); ?>1<? write('b');"), "write('a');\r\nwrite('1');\r\nwrite('b');\r\n");
    })
    it('close w/ inline', function(){
      assert.equal(temp.convert("write('a');?>1<? write('b'); ?>"), "write('a');\r\nwrite('1');\r\nwrite('b');\r\n");
    })
    it('include tag', function(){
      assert.equal(temp.convert("<include a.node>"), "write('hello');\r\n");
    })
  });
});
