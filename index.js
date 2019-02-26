#!/usr/bin/env node
const SVGSketch = require('./lib/index');

if (!process.argv[2]) {
    console.log('please include a valid <filePath> such as sketchsvg /Users/JakePeralta/test.sketch');
    return;
}

const instance = new SVGSketch();
instance.init(process.argv[2]);
