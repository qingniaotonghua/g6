const Shape = require('../shape');

function switchMinMax(bbox, type) {
  type = type.toUpperCase();
  const centerField = type === 'Y' ? 'centerX' : 'centerY';
  const newBBox = {};
  newBBox['min' + type] = bbox['max' + type];
  newBBox['max' + type] = bbox['min' + type];
  newBBox[centerField] = bbox[centerField];
  return newBBox;
}


Shape.registerEdge('trident', {

  getPathPoints(cfg) {
    const rankdir = cfg.rankdir;
    let sBBox = cfg.sourceNode.getBBox();
    let tBBox = cfg.targetNode.getBBox();
    const ratio = 0.5;
    let c0x,
      c0y,
      c1x,
      c1y,
      c2x,
      c2y,
      c3x,
      c3y;
    if (rankdir === 'TB' || rankdir === 'BT') {
      if (rankdir === 'BT') {
        sBBox = switchMinMax(sBBox, 'y');
        tBBox = switchMinMax(tBBox, 'y');
      }
      c0x = sBBox.centerX;
      c0y = sBBox.maxY;
      c1x = c0x;
      c1y = c0y + (tBBox.minY - c0y) * ratio;
      c2x = tBBox.centerX;
      c2y = c1y;
      c3x = c2x;
      c3y = tBBox.minY;
    } else {
      if (rankdir === 'RL') {
        sBBox = switchMinMax(sBBox, 'x');
        tBBox = switchMinMax(tBBox, 'x');
      }
      c0x = sBBox.maxX;
      c0y = sBBox.centerY;
      c1x = c0x + (tBBox.minX - c0x) * ratio;
      c1y = c0y;
      c2x = c1x;
      c2y = tBBox.centerY;
      c3x = tBBox.minX;
      c3y = c2y;
    }

    return {
      ...cfg,
      startPoint: { x: c0x, y: c0y },
      endPoint: { x: c3x, y: c3y },
      controlPoints: [{ x: c1x, y: c1y }, { x: c2x, y: c2y }]
    };
  }
}, 'single-line');
