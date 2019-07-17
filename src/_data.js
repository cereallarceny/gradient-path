import { DEFAULT_PRECISION } from './GradientPath';
import Sample from './Sample';
import Segment from './Segment';

export const getData = ({
  path,
  segments,
  samples,
  precision = DEFAULT_PRECISION
}) => {
  // We decrement the number of samples per segment because when we group them later we will add on the first sample of the following segment
  if (samples > 1) samples--;

  // Get total length of path, total number of samples, and two blank arrays to hold samples and segments
  const pathLength = path.getTotalLength(),
    totalSamples = segments * samples,
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

    allSamples.push(new Sample(x, y, progress));
  }

  // Out of all the samples gathered, sort them into groups of length = samples
  // Each group includes the samples of the current segment, with the last sample being first sample from the next group
  // This "nextStart" becomes the "currentStart" every time segment is interated
  for (let segment = 0; segment < segments; segment++) {
    const currentStart = segment * samples;
    const nextStart = currentStart + samples;
    const segmentSamples = [];

    for (let samInSeg = 0; samInSeg < samples; samInSeg++) {
      segmentSamples.push(allSamples[currentStart + samInSeg]);
    }

    segmentSamples.push(allSamples[nextStart]);

    allSegments.push(new Segment(segmentSamples));
  }

  return allSegments;
};

export const strokeToFill = (data, width, precision) => {
  const outlinedStrokes = outlineStrokes(data, width, precision);
  const averagedSegmentJoins = averageSegmentJoins(outlinedStrokes, precision);

  return averagedSegmentJoins;
};

const outlineStrokes = (data, width, precision) => {
  // We need to get the points perpendicular to a startPoint, given angle, radius, and precision
  const getPerpSamples = (angle, radius, precision, startPoint) => {
    const p0 = new Sample(
        Math.sin(angle) * radius + startPoint.x,
        -Math.cos(angle) * radius + startPoint.y,
        startPoint.progress
      ),
      p1 = new Sample(
        -Math.sin(angle) * radius + startPoint.x,
        Math.cos(angle) * radius + startPoint.y,
        startPoint.progress
      );

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

  for (let i = 0; i < data.length; i++) {
    const segment = data[i],
      segmentSamples = [];

    // For each sample point and the following sample point (if there is one) compute the angle and then various perpendicular points
    for (let j = 0; j < segment.samples.length; j++) {
      // If we're at the end of the segment and there are no further points
      if (segment.samples[j + 1] === undefined) break;

      const p0 = segment.samples[j], // The current sample point
        p1 = segment.samples[j + 1], // The next sample point
        angle = Math.atan2(p1.y - p0.y, p1.x - p0.x), // Perpendicular angle to p0 and p1
        p0Perps = getPerpSamples(angle, radius, precision, p0), // Get perpedicular points with a distance of radius away from p0
        p1Perps = getPerpSamples(angle, radius, precision, p1); // Get perpedicular points with a distance of radius away from p1

      // We only need the p0 perpendenciular points for the first sample
      if (j === 0) {
        segmentSamples.push(...p0Perps);
      }

      // Always push the second sample point's perpendicular points
      segmentSamples.push(...p1Perps);
    }

    // segmentSamples is out of order...
    // Given a segmentSamples length of 8, the points need to be rearranged from: 0, 2, 4, 6, 7, 5, 3, 1
    outlinedData.push(
      new Segment([
        ...segmentSamples.filter((s, i) => i % 2 === 0),
        ...segmentSamples.filter((s, i) => i % 2 === 1).reverse()
      ])
    );
  }

  return outlinedData;
};

const averageSegmentJoins = (outlinedData, precision) => {
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

  for (let i = 0; i < outlinedData.length; i++) {
    let curSeg = outlinedData[i], // The current segment
      nextSeg = outlinedData[i + 1] ? outlinedData[i + 1] : outlinedData[0], // The next segment, otherwise, the first segment
      curMiddle = curSeg.samples.length / 2, // The "middle" item in the current segment
      nextEnd = nextSeg.samples.length - 1; // The last item in the next segment

    // Average two sets of outlined points to create p0Average and p1Average
    const p0Average = avg(curSeg.samples[curMiddle - 1], nextSeg.samples[0]),
      p1Average = avg(curSeg.samples[curMiddle], nextSeg.samples[nextEnd]);

    if (precision) {
      p0Average.x = +p0Average.x.toFixed(precision);
      p0Average.y = +p0Average.y.toFixed(precision);
      p1Average.x = +p1Average.x.toFixed(precision);
      p1Average.y = +p1Average.y.toFixed(precision);
    }

    // Replace the previous values
    curSeg.samples[curMiddle - 1] = combine(
      curSeg.samples,
      curMiddle - 1,
      p0Average
    );
    curSeg.samples[curMiddle] = combine(curSeg.samples, curMiddle, p1Average);
    nextSeg.samples[0] = combine(nextSeg.samples, 0, p0Average);
    nextSeg.samples[nextEnd] = combine(nextSeg.samples, nextEnd, p1Average);
  }

  return outlinedData;
};

export const flattenSegments = data =>
  data
    .map((segment, i) =>
      segment.samples.map(
        sample => new Sample(sample.x, sample.y, sample.progress, i)
      )
    )
    .flat();
