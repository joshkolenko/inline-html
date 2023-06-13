"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var src_exports = {};
__export(src_exports, {
  inlineHTML: () => inlineHTML
});
module.exports = __toCommonJS(src_exports);
var import_node_html_parser = require("node-html-parser");
var import_path = __toESM(require("path"), 1);
var import_esbuild = __toESM(require("esbuild"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_sass = __toESM(require("sass"), 1);
var import_prettier = __toESM(require("prettier"), 1);
const inlineHTML = async (source, options) => {
  const config = {
    attribute: "inline",
    format: {
      printWidth: 200,
      tabWidth: 2,
      semi: true
    },
    ...options
  };
  let html, dir;
  if (import_fs.default.existsSync(source) && import_fs.default.lstatSync(source).isFile()) {
    html = import_fs.default.readFileSync(source, "utf-8");
    dir = import_path.default.parse(source).dir;
  } else {
    html = source;
    dir = options?.dir || process.cwd();
  }
  const document = (0, import_node_html_parser.parse)(html, {
    comment: true
  });
  const nodes = Array.from(document.querySelectorAll(`[${config.attribute}]`));
  for (const node of nodes) {
    if (node.tagName === "LINK") {
      const filePath = import_path.default.resolve(dir, node.getAttribute("href") || "");
      if (!import_fs.default.existsSync(filePath)) {
        throw new Error(`File not found at: ${filePath}`);
      }
      const output = import_sass.default.compile(filePath, {
        charset: false
      }).css;
      node.replaceWith(`<style>
${output}
</style>`);
    }
    if (node.tagName === "SCRIPT") {
      const filePath = import_path.default.resolve(dir, node.getAttribute("src") || "");
      if (!import_fs.default.existsSync(filePath)) {
        throw new Error(`File not found at: ${filePath}`);
      }
      const result = await import_esbuild.default.build({
        entryPoints: [filePath],
        format: "iife",
        bundle: true,
        write: false
      });
      const output = result.outputFiles[0].text;
      node.replaceWith(`<script>
${output}<\/script>`);
    }
  }
  if (!config.format) {
    return document.toString();
  }
  const formatted = import_prettier.default.format(document.toString(), {
    parser: "html",
    ...config.format
  });
  return formatted;
};
