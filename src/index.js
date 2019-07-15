import { svgElem, styleAttrs } from './_utils';
import { toPath } from 'svg-points';

export const getData = (
  path,
  numSegments,
  numSamplesPerSegment,
  precision = 3
) => {
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

// TODO: Do width of path
// TODO: Update D3 example and multiple elements stories to use fill for path
// TODO: Write new documentation and release new major version
export default ({ path, elements, data: { segments, samples, precision } }) => {
  const data = getData(path, segments, samples, precision),
    svg = path.closest('svg');

  path.parentNode.removeChild(path);

  const group = svgElem('g', { class: 'gradient-path' });
  svg.appendChild(group);

  elements.forEach(({ type, stroke, strokeWidth, fill, width }) => {
    const elemGroup = svgElem('g', { class: `element-${type}` });
    group.appendChild(elemGroup);

    if (type === 'path') {
      data.forEach(segment => {
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
