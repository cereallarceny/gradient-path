import tinygradient from 'tinygradient';

// Gets sample points on a path given a precision value and creates quad segments for them
export const getData = (path, precision) => {
  // Sample the SVG path uniformly with the specified precision.
  const getSamples = (path, precision) => {
    const pathLength = path.getTotalLength(),
      samples = [];

    samples.push(0);

    let i = 0;
    while ((i += precision) < pathLength) samples.push(i);

    samples.push(pathLength);

    return samples.map(t => {
      const { x, y } = path.getPointAtLength(t),
        a = [x, y];

      a.color = t / pathLength;

      return a;
    });
  };

  // Compute quads of adjacent points [p0, p1, p2, p3].
  const computeQuads = points =>
    [...Array(points.length - 1).keys()].map(i => {
      const a = [points[i - 1], points[i], points[i + 1], points[i + 2]];

      a.color = (points[i].color + points[i + 1].color) / 2;

      return a;
    });

  return computeQuads(getSamples(path, precision));
};

// Compute stroke outline for segment p12.
export const getPathPoints = (points, width) => {
  // Compute unit vector getPerpendicular to p01.
  const getPerpendicular = (p0, p1) => {
    const u01x = p0[1] - p1[1];
    const u01y = p1[0] - p0[0];
    const u01d = Math.sqrt(u01x * u01x + u01y * u01y);

    return [u01x / u01d, u01y / u01d];
  };

  // Compute intersection of two infinite lines ab and cd.
  const getIntersection = (a, b, c, d) => {
    const x1 = c[0],
      x3 = a[0],
      x21 = d[0] - x1,
      x43 = b[0] - x3,
      y1 = c[1],
      y3 = a[1],
      y21 = d[1] - y1,
      y43 = b[1] - y3,
      ua = (x43 * (y1 - y3) - y43 * (x1 - x3)) / (y43 * x21 - x43 * y21);

    return [x1 + ua * x21, y1 + ua * y21];
  };

  const p0 = points[0],
    p1 = points[1],
    p2 = points[2],
    p3 = points[3],
    r = width / 2,
    u12 = getPerpendicular(p1, p2);

  let a = [p1[0] + u12[0] * r, p1[1] + u12[1] * r];
  let b = [p2[0] + u12[0] * r, p2[1] + u12[1] * r];
  let c = [p2[0] - u12[0] * r, p2[1] - u12[1] * r];
  let d = [p1[0] - u12[0] * r, p1[1] - u12[1] * r];

  // Clip ad and dc using average of u01 and u12
  if (p0) {
    const u01 = getPerpendicular(p0, p1),
      e = [p1[0] + u01[0] + u12[0], p1[1] + u01[1] + u12[1]];

    a = getIntersection(p1, e, a, b);
    d = getIntersection(p1, e, d, c);
  }

  // Clip ab and dc using average of u12 and u23
  if (p3) {
    const u23 = getPerpendicular(p2, p3),
      e = [p2[0] + u23[0] + u12[0], p2[1] + u23[1] + u12[1]];

    b = getIntersection(p2, e, a, b);
    c = getIntersection(p2, e, d, c);
  }

  return [a, b, c, d];
};

// Creates a data attribute for use on an SVG path given 4 points (a quad)
export const getPathData = ([a, b, c, d]) => `M${a}L${b} ${c} ${d}Z`;

export default ({
  path,
  stops,
  width,
  precision = 1,
  stroke = false,
  repeat = false,
  debug = false
}) => {
  const data = getData(path, precision);
  const gradient = tinygradient(stops);
  const svg = path.closest('svg');

  path.parentNode.removeChild(path);

  const svgElem = (type, attrs) => {
    let elem = document.createElementNS('http://www.w3.org/2000/svg', type);

    Object.keys(attrs).forEach(attr => elem.setAttribute(attr, attrs[attr]));

    return elem;
  };

  const group = svgElem('g', { class: 'gradient-path' });
  svg.appendChild(group);

  data.forEach(quad => {
    const allPoints = getPathPoints(quad, width);
    const color = gradient.rgbAt(quad.color);
    const pathStyles = [];

    pathStyles.push(`fill: ${color};`);

    if (stroke) {
      pathStyles.push(`stroke: ${color};`);
      pathStyles.push(`stroke-width: ${stroke};`);
    }

    const quadPath = svgElem('path', {
      class: 'quad-path',
      d: getPathData(allPoints),
      style: pathStyles.join('')
    });

    group.appendChild(quadPath);

    if (debug) {
      quad.forEach(vertex => {
        if (vertex) {
          const segmentDot = svgElem('circle', {
            class: 'segment-dot',
            cx: vertex[0],
            cy: vertex[1],
            fill: '#000',
            r: 1
          });

          group.appendChild(segmentDot);
        }
      });

      allPoints.forEach(point => {
        const quadDot = svgElem('circle', {
          class: 'quad-dot',
          cx: point[0],
          cy: point[1],
          fill: '#f00',
          r: 1
        });

        group.appendChild(quadDot);
      });
    }
  });
};
