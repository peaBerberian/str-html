#!/usr/bin/env node
/* eslint-env node */

import * as fs from "node:fs";
import * as http from "node:http";
import * as path from "node:path";

const MIME_TYPES = {
  default: "application/octet-stream",
  html: "text/html; charset=UTF-8",
  js: "application/javascript",
  mjs: "application/javascript",
  wasm: "application/wasm",
  css: "text/css",
  png: "image/png",
  jpg: "image/jpg",
  gif: "image/gif",
  ico: "image/x-icon",
  svg: "image/svg+xml",
};

const toBool = [() => true, () => false];

async function prepareFile(dirName, url) {
  const paths = [dirName, url];
  if (url.endsWith("/")) {
    paths.push("index.html");
  }
  const filePath = path.join(...paths);
  const pathTraversal = !filePath.startsWith(dirName);
  const exists = await fs.promises.access(filePath).then(...toBool);
  const found = !pathTraversal && exists;
  if (!found) {
    console.error("File not found @", url);
    return null;
  }
  const ext = path.extname(filePath).substring(1).toLowerCase();
  const stream = fs.createReadStream(filePath);
  return { found, ext, stream };
}

export default function launchStaticServer(dirName, { httpPort }) {
  return new Promise((res, rej) => {
    const server = http.createServer(async (req, res) => {
      const file = await prepareFile(dirName, req.url);
      if (file === null) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.write("File not found.");
        res.end();
        return;
      }
      const mimeType = MIME_TYPES[file.ext] || MIME_TYPES.default;
      res.writeHead(200, { "Content-Type": mimeType });
      file.stream.pipe(res);
    });
    server.listen(httpPort);
    server.addListener("error", (error) => {
      rej(error);
    });
    server.addListener("close", () => {
      rej(new Error("Server closed"));
    });
    server.addListener("listening", () => {
      console.log(`Static server running at http://127.0.0.1:${httpPort}/`);
      res();
    });
  });
}
