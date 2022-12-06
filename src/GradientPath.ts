import { getData, strokeToFill } from './_data';
import { svgElem, styleAttrs, segmentToD, convertPathToNode } from './_utils';
import { DEFAULT_PRECISION } from './_constants';
import Segment from './Segment';

export interface RenderOptions {
  type: string;
  stroke?: string;
  strokeWidth?: number;
  fill: Record<string, any>[];
  width: number;
}

export default class GradientPath {
  public path: Record<string, any>;
  public segments: number;
  public samples: number;
  public precision?: number;

  public pathClosed: boolean;
  public renders: any[];
  public group: SVGElement;
  public svg: SVGElement;

  public data: Segment[];

  constructor({
    path,
    segments,
    samples,
    precision = DEFAULT_PRECISION
  }: {
    path: Record<string, any>;
    segments: number;
    samples: number;
    precision?: number;
  }) {
    // If the path being passed isn't a DOM node already, make it one
    this.path = convertPathToNode(path);

    // Check if nodeName is path and that the path is closed, otherwise it's closed by default
    this.pathClosed =
      this.path.nodeName == 'path'
        ? this.path.getAttribute('d').match(/z/gi)
        : true;

    // Get the data
    this.data = getData({ path, segments, samples, precision });

    this.segments = segments;
    this.samples = samples;
    this.precision = precision;

    // Store the render cycles that the user creates
    this.renders = [];

    // Append a group to the SVG to capture everything we render and ensure our paths and circles are properly encapsulated
    this.svg = path.closest('svg');

    this.group = svgElem('g', {
      class: 'gradient-path'
    });

    // Append the main group to the SVG
    this.svg.appendChild(this.group);

    // Remove the main path once we have the data values
    // this.path.parentNode.removeChild(this.path);
  }

  update(options: RenderOptions, path: Record<string, any> = this.path) {
    // If the path being passed isn't a DOM node already, make it one
    this.path = convertPathToNode(path);

    // Check if nodeName is path and that the path is closed, otherwise it's closed by default
    this.pathClosed =
      this.path.nodeName == 'path'
        ? this.path.getAttribute('d').match(/z/gi)
        : true;

    // Get the data
    this.data = getData({
      path,
      segments: this.segments,
      samples: this.samples,
      precision: this.precision!
    });

    const { children } = this.renderSegments(options);

    const paths = children.map(child => child.getAttribute('d')) as string[];
    const els = Array.from(
      this.group.querySelectorAll('.path-segment')
    ) as SVGPathElement[];

    els.forEach((el, index) => el.setAttribute('d', paths[index]));
  }

  renderSegments({ stroke, strokeWidth, fill, width }: RenderOptions) {
    const renderCycle: Record<string, any> = {};

    renderCycle.data =
      width && fill
        ? strokeToFill(this.data, width, this.precision!, this.pathClosed)
        : this.data;

    const children = renderCycle.data.map((seg: Segment) => {
      const { samples, progress } = seg;

      return svgElem('path', {
        class: 'path-segment',
        d: segmentToD(samples),
        ...styleAttrs(
          (fill as unknown) as string,
          stroke!,
          strokeWidth!,
          progress!
        )
      });
    }) as SVGPathElement[];

    return { renderCycle, children };
  }

  render({ type = 'path', stroke, strokeWidth, fill, width }: RenderOptions) {
    // Store information from this render cycle
    const { children, renderCycle } = this.renderSegments({
      type,
      stroke,
      strokeWidth,
      fill,
      width
    });

    // Create a group for each element
    const elemGroup = svgElem('g', { class: `element-${type}` });
    this.group.appendChild(elemGroup);

    renderCycle.group = elemGroup;

    children.forEach(element => {
      elemGroup.appendChild(element);
    });

    // Save the information in the current renderCycle and pop it onto the renders array
    this.renders.push(renderCycle);

    // Return this for method chaining
    return this;
  }
}
