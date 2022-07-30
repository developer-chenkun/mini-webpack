import fs from "fs";
import parser from "@babel/parser";
import traverse from "@babel/traverse";
import { resolve } from "path";
import ejs from "ejs";
import { transformFromAst } from "babel-core";

let id = 0;

function createAsset(filePath) {
  // 1.读取文件内容
  // 2.获取依赖关系
  const source = fs.readFileSync(filePath, {
    encoding: "utf-8",
  });

  // console.log(source);
  const ast = parser.parse(source, {
    sourceType: "module",
  });
  // console.log(ast);
  const deps = [];
  traverse.default(ast, {
    // 获取ast树中的依赖
    ImportDeclaration({ node }) {
      deps.push(node.source.value);
    },
  });
  // 将代码中的esm导入方式变成commonjs
  const { code } = transformFromAst(ast, null, {
    presets: ["env"],
  });
  return {
    code,
    deps,
    filePath,
    id: id++,
    mapping: {},
  };
}

function createGraph() {
  // 1.获取入口文件的所有依赖
  const mainAsset = createAsset("./example/main.js");
  // 2.遍历主文件依赖的文件 获取他们的依赖
  const queue = [mainAsset];
  for (const asset of queue) {
    asset.deps.forEach((relativePath) => {
      const path = resolve("./example", relativePath);
      const child = createAsset(path);
      asset.mapping[relativePath] = child.id;
      queue.push(child);
    });
  }
  return queue;
}

const graph = createGraph();

function build(graph) {
  const template = fs.readFileSync("./bundle.ejs", { encoding: "utf-8" });

  const data = graph.map((asset) => {
    return {
      filePath: asset.filePath,
      code: asset.code,
      id: asset.id,
      mapping: asset.mapping,
    };
  });
  console.log(data);
  const code = ejs.render(template, { data });

  fs.writeFileSync("./dist/bundle.js", code);
}

build(graph);
