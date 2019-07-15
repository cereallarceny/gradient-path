import tinygradient from 'tinygradient';

// This is an internal function to help with easily creating SVG elements with an object of attributes
export const svgElem = (type, attrs) => {
  let elem = document.createElementNS('http://www.w3.org/2000/svg', type);

  Object.keys(attrs).forEach(attr => elem.setAttribute(attr, attrs[attr]));

  return elem;
};

// This is an internal function to help with the repetition of adding fill, stroke, and stroke-width attributes
export const styleAttrs = (fill, stroke, strokeWidth, i) => {
  const determineColor = (type, i) =>
    typeof type === 'string' ? type : tinygradient(type).rgbAt(i);

  const attrs = {};

  if (stroke) {
    attrs['stroke'] = determineColor(stroke, i);
    attrs['stroke-width'] = strokeWidth;
  }

  if (fill) {
    attrs['fill'] = determineColor(fill, i);
  }

  return attrs;
};
