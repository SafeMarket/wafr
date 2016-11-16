#!/usr/bin/env node

const meow = require('meow');
const path = require('path');
const fs = require('fs');
const utils = require('../src/utils/index.js');
const wafr = require('../src/index.js');

// handle cli
const cli = meow(`
    Usage
      $ wafr <path to contract test>

    Options
      --help         the help CLI
      --output, -o   solc compile output to JSON
      --version, -v  the package verson number

    Examples
      $ wafr ./contracts --output ./build/contracts.json
`, {
  alias: {
    o: 'output',
  },
});

// output path
const outputPath = cli.flags.output;

// the main wafr code to run
wafr({ path: path.resolve(cli.input[0]), optimize: 1 }, (wafrError, wafrResult) => {
  if (wafrError) {
    throw new Error(`error while running wafr CLI: ${wafrError}`);

    // exit badly
    process.exit(1); // eslint-disable-line
  } else {
    // if status failure
    if (wafrResult.status === 'failure') {
      process.exit(1);
    } else {
      // if there is an output path, build sources
      if (typeof outputPath !== 'undefined') {
        fs.writeFile(path.resolve(outputPath), JSON.stringify(utils.filterTestsFromOutput(wafrResult.contracts)), (writeFileError) => {
          if (writeFileError) {
            throw new Error(`while writting output JSON file ${outputPath}: ${writeFileError}`);
          }

          process.exit(0);
        });
      } else {
        process.exit(0);
      }
    }
  }
});
