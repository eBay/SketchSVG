/*************************************************************
Copyright 2019 eBay Inc.
Author/Developer: Patrick Canella

Use of this source code is governed by an MIT-style
license that can be found in the LICENSE file or at
https://opensource.org/licenses/MIT.
************************************************************/

#!/usr/bin/env node
const SketchSVG = require('./lib/index');
const fs = require('fs');
const colors = require('colors');

if (!process.argv[2]) {
    console.log('please include a valid <filePath> such as sketchsvg /Users/JakePeralta/test.sketch');
    return;
} else if (process.argv[2] && !fs.existsSync(process.argv[2])) {
    console.log(colors.bgRed('Uh oh, looks like this file does NOT exist. Maybe there\'s a typo?'));
    return;
}

const instance = new SketchSVG();
instance.init(process.argv[2]);
