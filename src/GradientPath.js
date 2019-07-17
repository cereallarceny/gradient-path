import { getData, strokeToFill, flattenSegments } from './data';
import { svgElem, styleAttrs, segmentToD } from './_utils';

export default class GradientPath {
  constructor(path, numSegments, numSamples, precision = 2) {
    // If the path being passed isn't a DOM node already, make it one
    path =
      path instanceof Element || path instanceof HTMLDocument
        ? path
        : path.node();

    this.path = path;
    this.numSegments = numSegments;
    this.numSamples = numSamples;
    this.precision = precision;
    this.renders = [];

    this.svg = path.closest('svg');
    this.group = svgElem('g', {
      class: 'gradient-path'
    });

    this.data = getData(path, numSegments, numSamples, precision);

    // Append the main group to the SVG
    this.svg.appendChild(this.group);

    // Remove the main path once we have the data values
    this.path.parentNode.removeChild(path);
  }

  render({ type, stroke, strokeWidth, fill, width }) {
    const { group, precision } = this,
      renderCycle = {};

    // Create a group for each element
    const elemGroup = svgElem('g', { class: `element-${type}` });
    group.appendChild(elemGroup);

    renderCycle.group = elemGroup;

    if (type === 'path') {
      // If we specify a width, we will be filling, so we need to outline the path and then average the join points of the segments
      renderCycle.data =
        width && fill ? strokeToFill(this.data, width, precision) : this.data;

      for (let j = 0; j < renderCycle.data.length; j++) {
        const segment = renderCycle.data[j];

        // Create a path for each segment (array of samples) and append it to its elemGroup
        elemGroup.appendChild(
          svgElem('path', {
            class: 'path-segment',
            d: segmentToD(segment.samples),
            ...styleAttrs(fill, stroke, strokeWidth, segment.progress)
          })
        );
      }
    } else if (type === 'circle') {
      renderCycle.data = flattenSegments(this.data);

      for (let j = 0; j < renderCycle.data.length; j++) {
        const sample = renderCycle.data[j];

        // Create a circle for each sample (because we called "flattenSegments(data)" on the line before) and append it to its elemGroup
        elemGroup.appendChild(
          svgElem('circle', {
            class: 'circle-sample',
            cx: sample.x,
            cy: sample.y,
            r: width / 2,
            ...styleAttrs(fill, stroke, strokeWidth, sample.progress)
          })
        );
      }
    }

    // Save the information in the current renderCycle and pop it onto the renders array
    this.renders.push(renderCycle);

    return this;
  }
}
