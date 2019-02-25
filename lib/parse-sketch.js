const ns = require('node-sketch');
const colors = require('colors/safe');
const emoji = require('node-emoji');
const fs = require('fs');
module.exports = class ParseSketch {
    constructor() {
        this.foreignSymbolsArr = [];
        this.copyOfPage = {};
    }

    init(filename) {
        return new Promise((resolve, reject) => {
            ns.read(filename).then((sketch = {}) => {
                if (!sketch) {
                    console.error('Not a valid sketch file');
                    reject();
                }

                this.copyOfPage = JSON.parse(JSON.stringify(sketch.pages));
                let pageSymbolsCopy = sketch.pages[0].layers;
                const deDupeNames = [];

                if (pageSymbolsCopy[0]._class === 'artboard') {
                    pageSymbolsCopy = sketch.pages[0].layers[0].layers;
                }

                pageSymbolsCopy.forEach((instance, outerIdx) => {
                    console.log(instance.name);

                    // check for duplicates...
                    if (deDupeNames.indexOf(instance.name) > -1) {
                        return;
                    }
                    deDupeNames.push(instance.name);
                    instance.frame.x = 0;
                    instance.frame.y = 0;

                    if (instance._class === 'group') {
                        this.loopThroughGroup(instance);
                    }
                });

                const bigGroup = this.createGroup('thisName', this.foreignSymbolsArr);
                this.copyOfPage[0].horizontalRulerData.base = 0;
                this.copyOfPage[0].verticalRulerData.base = 0;
                bigGroup.frame.width = this.copyOfPage[0].layers[0].frame.width;
                bigGroup.frame.height = this.copyOfPage[0].layers[0].frame.height;
                bigGroup.frame.constrainProportions = false;
                sketch.pages = this.copyOfPage;
                sketch.pages[0].layers = [bigGroup];
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

    loopThroughGroup(group = {}) {
        group.layers.forEach(item => {
            if (item.name.includes('Documentation') || item.name.includes('Swatch')
                || item.name.includes('Frame') || item._class === 'text') {
                return;
            }

            if (item._class === 'group' || item._class === 'symbolInstance') {
                const thisGroup = item._class === 'symbolInstance' ? item.symbolMaster : item;
                this.loopThroughGroup(thisGroup);
            } else if (item._class === 'shapeGroup' || item._class === 'shapePath') {
                const itemClone = JSON.parse(JSON.stringify(item));
                itemClone.parent = null;
                itemClone.isClosed = true;
                itemClone.hasClippingMask = false;
                itemClone.frame.x = 0;
                itemClone.frame.y = 0;
                this.foreignSymbolsArr.push(itemClone);
            }
        });
    }

    createGroup(name = 'testname', addedLayers = []) {
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
                'height': 244,
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
