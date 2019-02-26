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

![alt text](https://media.giphy.com/media/1AeQc1qH6sfMlK9FOP/giphy.gif "Logo Title Text 1")

## Demo

We have included a couple of test files for single as well as multiple icons in a single sketch file. To try it out download our sample files in the `/sample` folder. 

First install `sketchsvg` and grab our `.sketch` files from the repo. Then:

`sketchsvg /path/to/multitest.sketch`

## Questions/Comments

Feel free to reach out to `patrickcanella AT gmail DOT com` for any questions or comments regarding this tool. Feel free to open an Issue or a Pull Request as you see fit. Thanks!


## License Information

Copyright 2019 eBay Inc. 
Author/Developer: Patrick J Canella

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
https://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
