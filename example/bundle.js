(function (modules) {
  function require(id) {
    const [fn, mapping] = modules[id];

    const module = {
      exports: {},
    };

    function localRequire(filePath) {
      const id = mapping[filePath];
      return require(id);
    }

    fn(localRequire, module, module.exports);

    return module.exports;
  }
  require("./main.js");
})({
  1: [
    function (require, module, exports) {
      // import { foo } from './foo.js'
      // 1.将esm翻译成cjs规范
      const { foo } = require("./foo.js");
      foo();
      console.log("main");
    },
    {
      "./foo.js": 2,
    },
  ],
  2: [
    function (require, module, exports) {
      // export function foo(){
      //   console.log('foo');
      // }
      function foo() {
        console.log("foo");
      }
      module.exports = {
        foo,
      };
    },
    {},
  ],
});
