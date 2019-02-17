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