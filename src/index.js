import { svgElem, styleAttrs } from './_utils';
import { toPath } from 'svg-points';

// The main data function!
// Provide an SVG path, the number of segments, number of samples in each segment, and an optional precision
// This will return an array of segments (length = numSeg), each with an array of samples (length = numSamPerSeg)
// Each sample contains an "x" and "y" value, as well as a "progress" value indicating it's relative position along the total length of the path
export const getData = (path, numSeg, numSamPerSeg, precision = 3) => {
  // If the path being passed isn't a DOM node already, make it one
  path =
    path instanceof Element || path instanceof HTMLDocument
      ? path
      : path.node();

  // We decrement the number of samples per segment because when we group them later we will add on the first sample of the following segment
  numSamPerSeg--;

  // Get total length of path, total number of samples, and two blank arrays to hold samples and segments
  const pathLength = path.getTotalLength(),
    totalSamples = numSeg * numSamPerSeg,
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

  // Out of all the samples gathered, sort them into groups of length = numSamPerSeg
  // Each group includes the samples of the current segment, with the last sample being first sample from the next group
  // This "nextStart" becomes the "currentStart" every time segment is interated
  for (let segment = 0; segment < numSeg; segment++) {
    const currentStart = segment * numSamPerSeg;
    const nextStart = currentStart + numSamPerSeg;
    const segments = [];

    for (let samInSeg = 0; samInSeg < numSamPerSeg; samInSeg++) {
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

export const getOutline = (data, width) => {
  console.log(`Outline stroke (width: ${width}) from:`, data);
};

// TODO: Do width of path
// TODO: Update D3 example and multiple elements stories to use fill for path
// TODO: Write new documentation and release new major version
export default ({ path, elements, data: { segments, samples, precision } }) => {
  const data = getData(path, segments, samples, precision),
    svg = path.closest('svg');

  // Remove the main path once we have the data values
  path.parentNode.removeChild(path);

  // Append a global group so that we don't mess with anything else in the SVG other than the requested path
  const group = svgElem('g', { class: 'gradient-path' });
  svg.appendChild(group);

  // For each element the user wants (path or circle), create them
  elements.forEach(({ type, stroke, strokeWidth, fill, width }) => {
    // Create a group for each element
    const elemGroup = svgElem('g', { class: `element-${type}` });
    group.appendChild(elemGroup);

    if (type === 'path') {
      data.forEach(segment => {
        console.log(getOutline(segment, width));

        // Create a path for each segment (array of samples) and append it to its elemGroup
        elemGroup.appendChild(
          svgElem('path', {
            class: 'path-segment',
            d: toPath(segment),
            ...styleAttrs(
              fill,
              stroke,
              strokeWidth,
              segment[(segment.length / 2) | 0].progress
            )
          })
        );
      });
    } else if (type === 'circle') {
      flatten(data).forEach(sample => {
        // Create a circle for each sample (because we called "flatten(data)" on the line before) and append it to its elemGroup
        elemGroup.appendChild(
          svgElem('circle', {
            class: 'circle-sample',
            cx: sample.x,
            cy: sample.y,
            r: width / 2,
            ...styleAttrs(fill, stroke, strokeWidth, sample.progress)
          })
        );
      });
    }
  });
};
