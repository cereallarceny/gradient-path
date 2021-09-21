import { Color } from './GradientPath';
import Sample from './Sample';
import tinygradient from 'tinygradient';

// An internal function to help with easily creating SVG elements with an object of attributes
export const svgElem = (type: string, attrs: Record<string, string>) => {
  const elem = document.createElementNS('http://www.w3.org/2000/svg', type),
    attributes = Object.keys(attrs);

  for (let i = 0; i < attributes.length; i++) {
    const attr = attributes[i];

    elem.setAttribute(attr, attrs[attr]);
  }

  return elem;
};

// An internal function to help with the repetition of adding fill, stroke, and stroke-width attributes
export const styleAttrs = (fill: Color[], stroke: Color[], strokeWidth: number, progress: number) => {
  const determineColor = (type: string | Color[], progress: number) =>
    typeof type === 'string' ? type : tinygradient(type).rgbAt(progress);

  let attrs = {} as Record<string, string>;

  if (stroke) {
    attrs = {
      ...attrs,
      stroke: determineColor(stroke, progress).toString(),
      "stroke-width": strokeWidth.toString()
    }
  }

  if (fill) {
    attrs = {
      ...attrs,
      fill: determineColor(fill, progress).toString()
    }
  }

  return attrs;
};

// An internal function to convert any array of samples into a "d" attribute to be passed to an SVG path
export const segmentToD = (samples: Sample[]) => {
  let d = '';

  for (let i = 0; i < samples.length; i++) {
    const { x, y } = samples[i],
      prevSample = i === 0 ? null : samples[i - 1];

    if (i === 0 && i !== samples.length - 1) {
      d += `M${x},${y}`;
    } else if (x !== prevSample?.x && y !== prevSample?.y) {
      d += `L${x},${y}`;
    } else if (x !== prevSample?.x) {
      d += `H${x}`;
    } else if (y !== prevSample?.y) {
      d += `V${y}`;
    }

    if (i === samples.length - 1) {
      d += 'Z';
    }
  }

  return d;
};

// An internal function for getting the colors of a segment, we need to get middle most sample (sorted by progress along the path)
export const getMiddleSample = (samples: Sample[]) => {
  const sortedSamples = [...samples].sort((a, b) => a.progress - b.progress);

  return sortedSamples[(sortedSamples.length / 2) | 0];
};

// An internal function for converting any D3 selection or DOM-like element into a DOM node
export const convertPathToNode = (path: SVGPathElement | Document | any) =>
  path instanceof Element || path instanceof Document ? path : path.node();
