/**
 * This script is a very simple implementation of an HTTP server to serve just
 * the files used by `str-html`, for example used by tests.
 *
 * I judged that writing the strict minimum actually needed here would be less
 * maintenance burden than installing a whole dependency (and perhaps needing
 * to update those regularly due to some obscure bug that most likely didn't
 * even concern us).
 */

import http from "http";
import fs from "fs";
import path from "path";
import process from "process";
import { fileURLToPath } from "url";

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { argv } = process;
  if (argv.includes("-h") || argv.includes("--help")) {
    displayHelp();
    process.exit(0);
  }

  // The script has been run directly
  const currentDirName = getCurrentDirectoryName();
  const servedFiles = {
    "index.html": {
      path: path.join(currentDirName, "index.html"),
      contentType: "text/html; charset=UTF-8",
    },

    // Yes, an empty string is actually a valid key!
    "": {
      path: path.join(currentDirName, "index.html"),
      contentType: "text/html; charset=UTF-8",
    },

    lib: {
      path: path.join(currentDirName, "lib", "index.mjs"),
      contentType: "application/javascript; charset=UTF-8",
    },

    "cases/index.mjs": {
      path: path.join(currentDirName, "cases", "index.mjs"),
      contentType: "application/javascript; charset=UTF-8",
    },

    main: {
      path: path.join(currentDirName, "..", "main.mjs"),
      contentType: "application/javascript; charset=UTF-8",
    },
  };

  let httpPort = 8695;
  let indexOfPort = argv.indexOf("-p");
  if (indexOfPort < 0) {
    indexOfPort = argv.indexOf("--port");
  }
  if (indexOfPort >= 0) {
    if (
      argv.length <= indexOfPort + 1 ||
      !/^[0-9]+$/.test(argv[indexOfPort + 1])
    ) {
      console.error(
        `\u001b[31mError:\u001b[0m No configured port despite a "${argv[indexOfPort]}" ` +
          "option.\n" +
          "You can also run this script with `--help` to have more information on " +
          "available options."
      );
      process.exit(1);
    }
    httpPort = +argv[indexOfPort + 1];
  }

  startStaticServer(servedFiles, httpPort);
}

export default function startStaticServer(files, port) {
  http
    .createServer(function (request, response) {
      const wantedFile = request.url?.substring("1");
      console.log(wantedFile, request.url, request.path);

      const fileObject = files[wantedFile];

      if (
        fileObject?.contentType === undefined ||
        fileObject.path === undefined
      ) {
        console.log(
          `\u001b[31mReceived request for unknown resource: ${wantedFile}\u001b[39m`
        );
        response.writeHead(404, {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "text/plain; charset=UTF-8",
        });
        response.end("No file found at the corresponding URL", "utf-8");
        return;
      }

      const { path: fileToRead, contentType } = fileObject;
      console.log(
        `Received request for known resource: \u001b[32m${fileToRead}\u001b[0m`
      );
      fs.readFile(fileToRead, function (error, fileContent) {
        if (error) {
          if (error.code === "ENOENT") {
            console.log(
              `\u001b[31mFile not reachable: ${fileToRead}\u001b[39m`
            );
            response.writeHead(404, {
              "Access-Control-Allow-Origin": "*",
              "Content-Type": "text/plain; charset=UTF-8",
            });
            response.end("No file found at the corresponding URL", "utf-8");
            return;
          } else {
            console.log(
              `\u001b[31mAn error occured while trying to read: ${fileToRead}\n` +
                `error: ${error.code}\u001b[39mA`
            );
            response.writeHead(500, {
              "Access-Control-Allow-Origin": "*",
              "Content-Type": "text/plain; charset=UTF-8",
            });
            response.end("An error occured: " + String(error.code), "utf-8");
            response.end();
          }
        } else {
          response.writeHead(200, {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": contentType,
          });
          response.end(fileContent, "utf-8");
        }
      });
    })
    .listen(port);

  for (const resource of Object.keys(files)) {
    const fileInfo = files[resource];
    console.log(
      `Serving \u001b[32m${fileInfo.path}\u001b[0m from route \u001b[32m/${resource}\u001b[0m`
    );
  }

  console.log(
    `\nServer running at \u001b[32mhttp://127.0.0.1:${port}\u001b[0m`
  );
  console.log("Simply go on this page on the wanted browser to run tests.");
  console.log("\nHit CTRL-C to stop the server");
}

/**
 * Returns the path to the directory where the current script is found.
 * @returns {String}
 */
function getCurrentDirectoryName() {
  return path.dirname(fileURLToPath(import.meta.url));
}

/**
 * Display through `console.log` an helping message relative to how to run this
 * script.
 */
function displayHelp() {
  console.log(
    /* eslint-disable indent */
    `Usage: node simple-static-server.mjs [options]
Options:
  -h, --help                   Display this help
  -p, --port <number>          Set a specific HTTP port for connections. 8695 by default.`
    /* eslint-enable indent */
  );
}
