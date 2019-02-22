const ns = require('node-sketch');
const Sketch = require('node-sketch/src/Sketch');
const Node = require('node-sketch/src/Node');

const colors = require('colors/safe');
const emoji = require('node-emoji');

module.exports = (filename) => {return new Promise((resolve, reject) => {
ns.read(filename).then((sketch = {}) => {
        if (!sketch) {
            console.error('Not a valid sketch file');
            reject();
        } 

        let tempArr;
        let count = 0;
        const layers = sketch.pages[0].layers;
        let copyForeignSymbols = sketch.document.foreignSymbols.slice(0);
        let foreignSymbolsArr = [];

        let bigGroup = createGroup('thisName', foreignSymbolsArr);
        let deDupeNames = [];
        
        copyForeignSymbols.forEach((instance, outerIdx)=> {
            let symbolMaster = instance.symbolMaster;
            const originalMaster = instance.originalMaster;
                if (!symbolMaster.name.includes('Icons') ) {
                    return;
                } else {
                // Go through layers and find relevant ones...
                console.log(symbolMaster.name);
                count++;

                // check for duplicates...
                if (deDupeNames.indexOf(symbolMaster.name) > -1){
                    return;
                }
                deDupeNames.push(symbolMaster.name);

                   
                    symbolMaster.layers = symbolMaster.layers.filter((thisLayer, innerIdx)=> {
                        return !thisLayer.name.includes('Swatch') /*&& !thisLayer.name.includes('Frame')*/ && thisLayer._class !== 'text';
                    });
                    symbolMaster.frame.x = 0;
                    symbolMaster.frame.y = 0;

                    if(symbolMaster.name === 'Sign_Out'){
                            debugger;
                        }

                    symbolMaster.layers.forEach((item) => {
                        let itemClone = item.clone();

                        if (itemClone._class === 'shapeGroup' || itemClone._class === 'shapePath') {
                            itemClone.parent = null;
                            itemClone.isClosed = true;
                            itemClone.hasClippingMask = false;
                            itemClone.frame.x = 0;
                            itemClone.frame.y = 0;
                            foreignSymbolsArr.push(itemClone);
                        }
                    });
                }
        });

        // sketch.document.set('foreignSymbols', [bigGroup]);

        // let pageLayers = JSON.parse(JSON.stringify(sketch.pages[0].layers));
        // let tempArray = [];

        // pageLayers = pageLayers.filter((thisLayer) => {
        //     console.log(thisLayer);
        //     if (thisLayer._class  === 'group') {
        //         thisLayer = thisLayer.layers.filter((innerLayer) => {
        //             if (innerLayer._class === 'group') {
        //                 // innerLayer.layers = innerLayer.layers.filter((innerInnerLayer)=> {
        //                 //         return innerInnerLayer._class === 'symbolInstance';
        //                 // });
        //                 return true;
        //             } else {
        //                 return false;
        //             }
        //         });
        //     return true
        //     } else {
        //         return false;
        //     }
        // })
        // //    thisLayer.layers.filter((subLayer)=> {
        // //         if (subLayer._class !== 'group') {
        // //             return false;
        // //         } else {
        // //         subLayer.layers = subLayer && subLayer.layers && subLayer.layers.filter((finalLayerInstance)=> {
        // //             if (finalLayerInstance._class !== 'symbolInstance' && finalLayerInstance._class !== 'group') {
        // //                 return false;
        // //             } else if (finalLayerInstance && finalLayerInstance._class === 'group') {
        // //                     finalLayerInstance.layers = finalLayerInstance.layers.filter((groupLayer)=> {
        // //                         if (groupLayer._class == 'symbolInstance') {
        // //                             let clonedLayer = JSON.parse(JSON.stringify(groupLayer));
        // //                             clonedLayer.frame.x = 0;
        // //                             clonedLayer.frame.y = 0;
        // //                             // groupLayer.frame.width = groupLayer.parent.frame.width;
        // //                             // groupLayer.frame.height = groupLayer.parent.frame.height
        // //                             delete clonedLayer.parent;
        // //                             tempArray.push(clonedLayer);
        // //                             return true;
        // //                         } else {
        // //                             return false;
        // //                         }
        // //                     });
        // //                 } else {
        // //                     return false;
        // //                 }
        // //         });
        // //         return true;
        // //     }
        // //     });
        // // });



    console.log('Number of SVGs to be converted: ' + count);

        sketch.pages[0].horizontalRulerData.base = 0;
        sketch.pages[0].verticalRulerData.base = 0;
        bigGroup.resizingConstraint = 0;
        sketch.pages[0].set('layers', [bigGroup]);
        const filename = '/temp3.sketch';
        sketch.save(__dirname + filename).then( ()=> {
           console.log(emoji.emojify(':male_mage: :sparkles:') + colors.green(`Automagically${emoji.emojify(':sparkles:')} extracted SVGs from sketch! Woohoo!`));
           console.log(colors.gray('\nOkay, now let\'s compress and convert to an easy copy/paste format...'));
            resolve(__dirname + filename);
        });
        
    });
    });
};



function createGroup(name = 'testnamez', addedLayers = []) {
    return {
    "_class": "group",
    "do_objectID": "33085ED7-397B-4409-BF87-2D746DED0D84",
    "booleanOperation": 0,
    "exportOptions": {
        "_class": "exportOptions",
        "exportFormats": [],
        "includedLayerIds": [],
        "layerOptions": 0,
        "shouldTrim": false
    },
    "frame": {
        "_class": "rect",
        "constrainProportions": false,
        "height": 301,
        "width": 960,
        "x": 0,
        "y": 0
    },
    "isFixedToViewport": false,
    "isFlippedHorizontal": false,
    "isFlippedVertical": false,
    "isLocked": false,
    "isVisible": true,
    "layerListExpandedType": 0,
    "name": name,
    "nameIsFixed": false,
    "resizingConstraint": 0,
    "resizingType": 0,
    "rotation": 0,
    "shouldBreakMaskChain": false,
    "clippingMaskMode": 0,
    "hasClippingMask": false,
    "style": {
        "_class": "style",
        "endMarkerType": 0,
        "miterLimit": 10,
        "startMarkerType": 0,
        "windingRule": 1
    },
    "groupLayout": {
        "_class": "MSImmutableFreeformGroupLayout"
    },
    "hasClickThrough": false,
    "layers": addedLayers
};
}
