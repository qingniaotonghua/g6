/**
 * 用于测试文本或者 html 节点大小，考虑到用户可以在 item.style 上设置某些 svg 属性样式来影响内部元素尺寸，故这里采用 foreignObject 来测量尺寸，当shape 为 dom 元素时，在item.style中设置的样式会被设置到foreignObject上，而 html dom 会被插入foreignObject，可以继承某些影响尺寸的属性样式。
 * 但是目前能够想到的只有字体相关属性能够从foreignObject元素继承到其内部的 html 元素，其他比如stroke-width并不会继承下去; 用foreignObject还有一个好处就是能够避免用户在 item.style 中配置了错误的 css 属性造成测量上的偏差。
 * @fileOverview htmlSizeMeasure
 * @author wangwei
 */

const modifyCSS = require('@antv/util/lib/dom/modify-css');
const createDom = require('@antv/util/lib/dom/create-dom');
const effectSizeAttrs = {
  fontSize: 'font-size',
  fontWeight: 'font-weight',
  fontFamily: 'font-family',
  fontVariant: 'font-variant'
};
const effectSizeAttrsKeys = Object.keys(effectSizeAttrs);
function initTestSizeSvg(id = 'svg-for-test') {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.id = id;
  modifyCSS(svg, {
    position: 'absolute',
    zIndex: '-9999',
    visibility: 'hidden'
  });
  document.body.appendChild(svg);
  return initMeasureGroupForHtmlLabel(svg);
}

function initMeasureGroupForHtmlLabel(svgRoot) {
  const foriegnObjectForTest = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
  foriegnObjectForTest.style.boxSizing = 'padding-box';
  foriegnObjectForTest.setAttribute('width', 1000);
  foriegnObjectForTest.setAttribute('height', 1000);
  svgRoot.appendChild(foriegnObjectForTest);
  const htmlContainerForTest = createDom('<div style="display:inline-block"></div>');
  foriegnObjectForTest.appendChild(htmlContainerForTest);
  return function(html, attrs) {
    if (typeof html === 'string') {
      html = createDom(html);
    } else if (!html instanceof HTMLElement) {
      console.error('the element is not HTMLElement,can\'t measure its\'size');
      return [ null, null ];
    }
    const hasAttr = [];
    effectSizeAttrsKeys.forEach(attr => {
      const svgAttr = effectSizeAttrs[attr];
      if (svgAttr) {
        hasAttr.push(svgAttr);
        foriegnObjectForTest.setAttribute(svgAttr, attrs[attr]);
      }
    });

    htmlContainerForTest.appendChild(html);
    const { width, height } = htmlContainerForTest.getBoundingClientRect();
    hasAttr.forEach(attr => {
      foriegnObjectForTest.removeAttribute(attr);
    });
    htmlContainerForTest.removeChild(html);
    return [ width, height ];
  };
}

module.exports = {
  htmlSizeMeasure: initTestSizeSvg()
};

