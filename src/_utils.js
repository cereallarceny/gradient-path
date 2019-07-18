import tinygradient from 'tinygradient';

// An internal function to help with easily creating SVG elements with an object of attributes
export const svgElem = (type, attrs) => {
  const elem = document.createElementNS('http://www.w3.org/2000/svg', type),
    attributes = Object.keys(attrs);

  for (let i = 0; i < attributes.length; i++) {
    const attr = attributes[i];

    elem.setAttribute(attr, attrs[attr]);
  }

  return elem;
};

// An internal function to help with the repetition of adding fill, stroke, and stroke-width attributes
export const styleAttrs = (fill, stroke, strokeWidth, progress) => {
  const determineColor = (type, progress) =>
    typeof type === 'string' ? type : tinygradient(type).rgbAt(progress);

  const attrs = {};

  if (stroke) {
    attrs['stroke'] = determineColor(stroke, progress);
    attrs['stroke-width'] = strokeWidth;
  }

  if (fill) {
    attrs['fill'] = determineColor(fill, progress);
  }

  return attrs;
};

// An internal function to convert any array of samples into a "d" attribute to be passed to an SVG path
export const segmentToD = samples => {
  let d = '';

  for (let i = 0; i < samples.length; i++) {
    const { x, y } = samples[i],
      prevSample = i === 0 ? null : samples[i - 1];

    if (i === 0 && i !== samples.length - 1) {
      d += `M${x},${y}`;
    } else if (x !== prevSample.x && y !== prevSample.y) {
      d += `L${x},${y}`;
    } else if (x !== prevSample.x) {
      d += `H${x}`;
    } else if (y !== prevSample.y) {
      d += `V${y}`;
    }

    if (i === samples.length - 1) {
      d += 'Z';
    }
  }

  return d;
};

// An internal function for getting the colors of a segment, we need to get middle most sample (sorted by progress along the path)
export const getMiddleSample = samples => {
  const sortedSamples = [...samples].sort((a, b) => a.progress - b.progress);

  return sortedSamples[(sortedSamples.length / 2) | 0];
};

// An internal function for converting any D3 selection or DOM-like element into a DOM node
export const convertPathToNode = path =>
  path instanceof Element || path instanceof HTMLDocument ? path : path.node();
