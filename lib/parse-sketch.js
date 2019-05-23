/** ***********************************************************
Copyright 2019 eBay Inc.
Author/Developer: Patrick Canella

Use of this source code is governed by an MIT-style
license that can be found in the LICENSE file or at
https://opensource.org/licenses/MIT.
************************************************************/

const ns = require('node-sketch');
const colors = require('colors/safe');
const emoji = require('node-emoji');
const fs = require('fs');
const r = require('@ebay/retriever');
module.exports = class ParseSketch {
    constructor() {
        this.foreignSymbolsArr = [];
        this.copyOfPage = {};
    }

    /**
     * This takes the filepath of the sketch file via cli argument and then uses sketchtool cli
     * to extract SVGs from the desired layers. We then create a group, put the SVGs in there
     * and save a temporary .sketch file to read from after parsing/stripping the unneeded data
     * @param {String} filename the filepath of the .sketch file
     * @returns {Promise} A promise that is resolved after we save the temp .sketch file created
     */
    init(filename) {
        return new Promise((resolve, reject) => {
            ns.read(filename).then((sketch = {}) => {
                if (!sketch) {
                    console.error('Not a valid sketch file');
                    reject();
                }

                this.copyOfPage = JSON.parse(JSON.stringify(sketch.pages));
                let pageLayers = r.need(sketch.pages, '[0].layers', []);
                const deDupeNames = [];

                if (pageLayers[0] && pageLayers[0]._class === 'artboard') {
                    pageLayers = r.need(sketch.pages, '[0].layers[0].layers', []);
                    // pageLayers = sketch.pages[0].layers[0].layers;
                }

                pageLayers.forEach((instance, outerIdx) => {
                    // check for duplicates...
                    if (deDupeNames.indexOf(instance.name) > -1) {
                        return;
                    }
                    deDupeNames.push(instance.name);

                    if (instance.frame) {
                        instance.frame.x = 0;
                        instance.frame.y = 0;
                    }

                    if (instance._class === 'group') {
                        this.loopThroughGroup(instance);
                    } else if (instance._class === 'symbolInstance') {
                        this.loopThroughGroup(instance && instance.symbolMaster);
                    }
                });

                const finalGroup = this.createGroup('sketchSVGTempGroup', this.foreignSymbolsArr);
                this.copyOfPage[0].horizontalRulerData.base = 0;
                this.copyOfPage[0].verticalRulerData.base = 0;
                finalGroup.frame.width = r.need(this.copyOfPage, '[0].layers[0].frame.width', 0);
                finalGroup.frame.height = r.need(this.copyOfPage, '[0].layers[0].frame.height', 0);
                finalGroup.frame.constrainProportions = false;
                sketch.pages = this.copyOfPage;
                sketch.pages[0].layers = [finalGroup];
                const tempFilePath = '/temp.sketch';
                const dir = `${__dirname}/tmpsvgs`;

                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir);
                }

                sketch.save(__dirname + tempFilePath).then(() => {
                    console.log(emoji.emojify(':male_mage: :sparkles:') +
                        colors.green(`Automagically${emoji.emojify(':sparkles:')} extracted SVGs from sketch! Woohoo!`));
                    console.log(colors.gray('\nOkay, now let\'s compress and convert to an easy copy/paste format...'));
                    resolve(__dirname + tempFilePath);
                });
            });
        });
    }

    /**
     * Here we loop through the sketch file's "groups" and take out only the necessary icon layers.
     * If it's a symbolInstance, group, shapeGroup or shapePath we want it, otherwise we strip it out.
     * @param {Object} group the specified group we are looping over, if there are multiples
     * @param {String} title The title set by the group for the icon (like /Arrows/Chevron-Left)
     */
    loopThroughGroup(group = {}, title) {
        let extractedTitle = title;
        group.layers.forEach(item => {
            // We want to ignore any irrelevant layers at this point.
            if (item.name.includes('Documentation') || item.name.includes('Swatch')
                || item.name.includes('Frame') || item._class === 'text') {
                return;
            }

            if (item._class === 'group' || item._class === 'symbolInstance') {
                const thisGroup = item._class === 'symbolInstance' ? item.symbolMaster : item;
                if (item.layers) {
                    item.layers.forEach((thisItem) => {
                        if (thisItem._class === 'text') {
                            extractedTitle = thisItem.name;
                        }
                    });
                }
                this.loopThroughGroup(thisGroup, extractedTitle);
            } else if (item._class === 'shapeGroup' || item._class === 'shapePath') {
                const itemClone = JSON.parse(JSON.stringify(item));
                itemClone.parent = null;
                itemClone.isClosed = true;
                itemClone.hasClippingMask = false;
                itemClone.frame.x = 0;
                itemClone.frame.y = 0;
                itemClone.name = extractedTitle || itemClone.name;
                this.foreignSymbolsArr.push(itemClone);
            }
        });
    }

    /**
     * We create a temp layer to inject into our temp sketch file, so we can strip out anything unnecessary.
     * @param {Object} name Defaults to sketchSVGTempGroup, the temp group we create if the name isn't there
     * @param {Array} addedLayers Layers we add to the temp Group
     */
    createGroup(name = 'sketchSVGTempGroup', addedLayers = []) {
        return {
            '_class': 'group',
            'do_objectID': '33085ED7-397B-4409-BF87-2D746DED0D84',
            'booleanOperation': 0,
            'exportOptions': {
                '_class': 'exportOptions',
                'exportFormats': [],
                'includedLayerIds': [],
                'layerOptions': 0,
                'shouldTrim': false
            },
            'frame': {
                '_class': 'rect',
                'constrainProportions': true,
                'height': 244, // TODO don't hardcode these, but instead base them on existing values
                'width': 779,
                'x': 0,
                'y': 0
            },
            'isFixedToViewport': false,
            'isFlippedHorizontal': false,
            'isFlippedVertical': false,
            'isLocked': false,
            'isVisible': true,
            'layerListExpandedType': 0,
            'name': name,
            'nameIsFixed': false,
            'resizingConstraint': 63,
            'resizingType': 0,
            'rotation': 0,
            'shouldBreakMaskChain': false,
            'clippingMaskMode': 0,
            'hasClippingMask': false,
            'style': {
                '_class': 'style',
                'endMarkerType': 0,
                'miterLimit': 10,
                'startMarkerType': 0,
                'windingRule': 1
            },
            'groupLayout': {
                '_class': 'MSImmutableFreeformGroupLayout'
            },
            'hasClickThrough': false,
            'layers': addedLayers
        };
    }
};
