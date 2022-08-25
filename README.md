# SketchSVG

### What is it?

SketchSVG is a CLI that is intended to convert icons made in Sketch to compressed, easy to use SVGs for use on the web. SketchSVG also will convert these to a Base64 encoded value so they can be used in conjunction with the CSS `url` property.

### Installation

**Important: It should be noted that this is for Mac only, since Sketch is only on Mac OS**
`npm install sketchsvg -g`  
**or if you prefer yarn**
`yarn global add sketchsvg`

### Usage

Once installed, run `sketchsvg` like so:

`sketchsvg /full/path/to/file`

From there, SketchSVG will convert your icons to SVGs as well as Base64s and output them like so:

![alt text](https://i.imgur.com/YMmTeVZ.png "Logo Title Text 1")

**SketchSVG will also generate a basic HTML page with a bare bones editor for you to test out your icons, change the colors, sizes, etc. Here is a screenshot of this:**

![Screen Shot 2022-08-25 at 2 33 28 PM](https://user-images.githubusercontent.com/4923719/186773008-041b3734-d3bf-43f8-af73-4535c7f3a243.png)


## Demo

We have included a couple of test files for single as well as multiple icons in a single sketch file. To try it out download our sample files in the `/sample` folder. 

First install `sketchsvg` and grab our `.sketch` files from the repo. Then:

`sketchsvg /path/to/multitest.sketch`

## Contributing

Interested in contributing? That's awesome! Please check out our [Contributing Guidelines](https://github.corp.ebay.com/pcanella/sketchsvg/blob/dev/CONTRIBUTING.md). 

## Questions/Comments

Feel free to reach out to `patrickcanella AT gmail DOT com` for any questions or comments regarding this tool. Feel free to open an Issue or a Pull Request as you see fit. Thanks!


## License

Copyright 2019 eBay Inc. <BR>
Developer: Patrick Canella

Use of this source code is governed by an MIT-style license that can be found in the LICENSE file or at https://opensource.org/licenses/MIT.

## 3rd Party Code
Sketch is a third party tool, not provided with this code, and will need to be licensed separately. For details, see:
https://www.sketch.com/
