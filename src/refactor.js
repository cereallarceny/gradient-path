import tinygradient from 'tinygradient';

export const getData = (path, numSegments, numSamplesPerSegment, precision) => {
  // If the path being passed isn't a DOM node already, make it one
  path =
    path instanceof Element || path instanceof HTMLDocument
      ? path
      : path.node();

  // Get total length of path, total number of samples, and two blank arrays to hold samples and segments
  const pathLength = path.getTotalLength(),
    totalSamples = numSegments * numSamplesPerSegment,
    allSamples = [],
    allSegments = [];

  // For the number of total samples, get the x, y, and progress values for each sample along the path
  for (let sample = 0; sample <= totalSamples; sample++) {
    const progress = sample / totalSamples;
    let { x, y } = path.getPointAtLength(progress * pathLength);

    // If the user asks to round our x and y values, do so
    if (precision) {
      x = x.toFixed(precision);
      y = y.toFixed(precision);
    }

    allSamples.push({
      x,
      y,
      progress
    });
  }

  // Out of all the samples gathered, sort them into groups of n+1 size (where n is the numSamplesPerSegment)
  // If numSegments = 10 and numSamplesPerSegment = 4 then allSegments will be 10 groups of 5 samples
  // This includes the numSamplesPerSegment plus the next item that will be sampled
  // This "nextStart" becomes the "currentStart" every time segment is interated
  for (let segment = 0; segment < numSegments; segment++) {
    const currentStart = segment * numSamplesPerSegment;
    const nextStart = currentStart + numSamplesPerSegment;
    const segments = [];

    for (let samInSeg = 0; samInSeg < numSamplesPerSegment; samInSeg++) {
      segments.push(allSamples[currentStart + samInSeg]);
    }

    segments.push(allSamples[nextStart]);

    allSegments.push(segments);
  }

  return allSegments;
};

// Flatten all values, but preserve the id (each sample in a segment group has the same id)
// This is helpful for rendering all of samples (as dots in the path, or whatever you'd like)
export const flatten = pieces =>
  pieces
    .map((segment, i) => {
      return segment.map(sample => {
        return { ...sample, id: i };
      });
    })
    .flat();

export default ({
  path,
  colors,
  width,
  segments,
  samples,
  precision,
  debug = false
}) => {
  const data = getData(path, segments, samples, precision);
  const gradient = tinygradient(colors);
  const svg = path.closest('svg');

  path.parentNode.removeChild(path);

  const svgElem = (type, attrs) => {
    let elem = document.createElementNS('http://www.w3.org/2000/svg', type);

    Object.keys(attrs).forEach(attr => elem.setAttribute(attr, attrs[attr]));

    return elem;
  };

  const group = svgElem('g', { class: 'gradient-path' });
  svg.appendChild(group);

  console.log('DATA', data);
  console.log('GRADIENT', gradient);
  console.log('WIDTH', width);
  console.log('DEBUG', debug);

  // data.forEach(quad => {
  //   const allPoints = getPathPoints(quad, width);
  //   const color = gradient.rgbAt(quad.color);
  //   const pathStyles = [];

  //   pathStyles.push(`fill: ${color};`);

  //   if (stroke) {
  //     pathStyles.push(`stroke: ${color};`);
  //     pathStyles.push(`stroke-width: ${stroke};`);
  //   }

  //   const quadPath = svgElem('path', {
  //     class: 'quad-path',
  //     d: getPathData(allPoints),
  //     style: pathStyles.join('')
  //   });

  //   group.appendChild(quadPath);

  //   if (debug) {
  //     quad.forEach(vertex => {
  //       if (vertex) {
  //         const segmentDot = svgElem('circle', {
  //           class: 'segment-dot',
  //           cx: vertex[0],
  //           cy: vertex[1],
  //           fill: '#000',
  //           r: 1
  //         });

  //         group.appendChild(segmentDot);
  //       }
  //     });

  //     allPoints.forEach(point => {
  //       const quadDot = svgElem('circle', {
  //         class: 'quad-dot',
  //         cx: point[0],
  //         cy: point[1],
  //         fill: '#f00',
  //         r: 1
  //       });

  //       group.appendChild(quadDot);
  //     });
  //   }
  // });
};
