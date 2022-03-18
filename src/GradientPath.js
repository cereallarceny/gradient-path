import { getData, strokeToFill } from './_data';
import { svgElem, styleAttrs, segmentToD, convertPathToNode } from './_utils';
import { DEFAULT_PRECISION } from './_constants';

export default class GradientPath {
  constructor({ path, segments, samples, precision = DEFAULT_PRECISION }) {
    // If the path being passed isn't a DOM node already, make it one
    this.path = convertPathToNode(path);

    this.segments = segments;
    this.samples = samples;
    this.precision = precision;

    // Check if nodeName is path and that the path is closed, otherwise it's closed by default
    this.pathClosed =
      this.path.nodeName == 'path'
        ? this.path.getAttribute('d').match(/z/gi)
        : true;

    // Store the render cycles that the user creates
    this.renders = [];

    // Append a group to the SVG to capture everything we render and ensure our paths and circles are properly encapsulated
    this.svg = path.closest('svg');
    this.group = svgElem('g', {
      class: 'gradient-path'
    });

    // Get the data
    this.data = getData({ path, segments, samples, precision });

    // Append the main group to the SVG
    this.svg.appendChild(this.group);

    // Remove the main path once we have the data values
    this.path.parentNode.removeChild(this.path);
  }

  render({ type, stroke, strokeWidth, fill, width }) {
    // Store information from this render cycle
    const renderCycle = {};

    // Create a group for each element
    const elemGroup = svgElem('g', { class: `element-${type}` });

    this.group.appendChild(elemGroup);
    renderCycle.group = elemGroup;

    if (type === 'path') {
      // If we specify a width and fill, then we need to outline the path and then average the join points of the segments
      // If we do not specify a width and fill, then we will be stroking and can leave the data "as is"
      renderCycle.data =
        width && fill
          ? strokeToFill(this.data, width, this.precision, this.pathClosed)
          : this.data;

      for (let j = 0; j < renderCycle.data.length; j++) {
        const { samples, progress } = renderCycle.data[j];

        // Create a path for each segment and append it to its elemGroup
        elemGroup.appendChild(
          svgElem('path', {
            class: 'path-segment',
            d: segmentToD(samples),
            ...styleAttrs(fill, stroke, strokeWidth, progress)
          })
        );
      }
    } else if (type === 'circle') {
      renderCycle.data = this.data.flatMap(({ samples }) => samples);

      for (let j = 0; j < renderCycle.data.length; j++) {
        const { x, y, progress } = renderCycle.data[j];

        // Create a circle for each sample and append it to its elemGroup
        elemGroup.appendChild(
          svgElem('circle', {
            class: 'circle-sample',
            cx: x,
            cy: y,
            r: width / 2,
            ...styleAttrs(fill, stroke, strokeWidth, progress)
          })
        );
      }
    }

    // Save the information in the current renderCycle and pop it onto the renders array
    this.renders.push(renderCycle);

    // Return this for method chaining
    return this;
  }
}
