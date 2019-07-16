import { svgElem, styleAttrs } from './_utils';
import { toPath } from 'svg-points';

const DEFAULT_PRECISION = 1;

// The main data function!
// Provide an SVG path, the number of segments, number of samples in each segment, and an optional precision
// This will return an array of segments (length = numSeg), each with an array of samples (length = numSamPerSeg)
// Each sample contains an x and y value, as well as a progress value indicating it's relative position along the total length of the path
export const getData = (
  path,
  numSeg,
  numSamPerSeg,
  precision = DEFAULT_PRECISION
) => {
  // If the path being passed isn't a DOM node already, make it one
  path =
    path instanceof Element || path instanceof HTMLDocument
      ? path
      : path.node();

  // We decrement the number of samples per segment because when we group them later we will add on the first sample of the following segment
  if (numSamPerSeg > 1) numSamPerSeg--;

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
      x = +x.toFixed(precision);
      y = +y.toFixed(precision);
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

// Given each segment in data, width, and precision level, outline a path one segment at a time
export const outlineStrokes = (data, width, precision) => {
  // We need to get the points perpendicular to a startPoint, given angle, radius, and precision
  const getPerpPoints = (angle, radius, precision, startPoint) => {
    const p0 = {
        x: Math.sin(angle) * radius + startPoint.x,
        y: -Math.cos(angle) * radius + startPoint.y,
        progress: startPoint.progress
      },
      p1 = {
        x: -Math.sin(angle) * radius + startPoint.x,
        y: Math.cos(angle) * radius + startPoint.y,
        progress: startPoint.progress
      };

    if (precision) {
      p0.x = +p0.x.toFixed(precision);
      p0.y = +p0.y.toFixed(precision);
      p1.x = +p1.x.toFixed(precision);
      p1.y = +p1.y.toFixed(precision);
    }

    return [p0, p1];
  };

  const radius = width / 2,
    outlinedData = [];

  data.forEach(segment => {
    const segmentData = [];
    // For each sample point and the following sample point (if there is one) compute the angle and then various perpendicular points
    segment.forEach((sample, i) => {
      // If we're at the end of the segment and there are no further points
      if (segment[i + 1] === undefined) return;

      const p0 = segment[i], // The current sample point
        p1 = segment[i + 1], // The next sample point
        angle = Math.atan2(p1.y - p0.y, p1.x - p0.x), // Perpendicular angle to p0 and p1
        p0Perps = getPerpPoints(angle, radius, precision, p0), // Get perpedicular points with a distance of radius away from p0
        p1Perps = getPerpPoints(angle, radius, precision, p1); // Get perpedicular points with a distance of radius away from p1

      // We only need the p0 perpendenciular points for the first sample
      if (i === 0) {
        segmentData.push(...p0Perps);
      }

      // Always push the second sample point's perpendicular points
      segmentData.push(...p1Perps);
    });

    // segmentData is out of order...
    // Given a segmentData length of 8, the points need to be rearranged from: 0, 2, 4, 6, 7, 5, 3, 1
    outlinedData.push([
      ...segmentData.filter((s, i) => i % 2 === 0),
      ...segmentData.filter((s, i) => i % 2 === 1).reverse()
    ]);
  });

  return outlinedData;
};

// Given each segment of data and a precision, find the average join points between adjacent segments and average the values
export const averageSegmentJoins = (data, precision) => {
  // Find the average x and y between two points (p0 and p1)
  const avg = (p0, p1) => ({
    x: (p0.x + p1.x) / 2,
    y: (p0.y + p1.y) / 2
  });

  // Recombine the new x and y positions with all the other keys in the object
  const combine = (segment, pos, avg) => ({
    ...segment[pos],
    x: avg.x,
    y: avg.y
  });

  data.forEach((segment, i) => {
    let curSeg = data[i], // The current segment
      nextSeg = data[i + 1] ? data[i + 1] : data[0], // The next segment, otherwise, the first segment
      curMiddle = curSeg.length / 2, // The "middle" item in the current segment
      nextEnd = nextSeg.length - 1; // The last item in the next segment

    // Average two sets of outlined points to create p0Average and p1Average
    const p0Average = avg(curSeg[curMiddle - 1], nextSeg[0]),
      p1Average = avg(curSeg[curMiddle], nextSeg[nextEnd]);

    if (precision) {
      p0Average.x = +p0Average.x.toFixed(precision);
      p0Average.y = +p0Average.y.toFixed(precision);
      p1Average.x = +p1Average.x.toFixed(precision);
      p1Average.y = +p1Average.y.toFixed(precision);
    }

    // Replace the previous values
    curSeg[curMiddle - 1] = combine(curSeg, curMiddle - 1, p0Average);
    curSeg[curMiddle] = combine(curSeg, curMiddle, p1Average);
    nextSeg[0] = combine(nextSeg, 0, p0Average);
    nextSeg[nextEnd] = combine(nextSeg, nextEnd, p1Average);
  });

  return data;
};

// The main export, allowing the user the ability to pass any DOM path have have a regenerated group of paths or circles
export default ({
  path,
  elements,
  data: { segments, samples, precision = DEFAULT_PRECISION }
}) => {
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
      let pathData;

      // If we specify a width, we will be filling, so we need to outline the path and then average the join points of the segments
      if (width) {
        const outlinedStrokes = outlineStrokes(data, width, precision),
          averagedSegments = averageSegmentJoins(outlinedStrokes, precision);

        pathData = averagedSegments;
      }
      // Otherwise, just use the path and stroke it
      else {
        pathData = data;
      }

      pathData.forEach(segment => {
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
