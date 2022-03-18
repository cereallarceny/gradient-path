import Sample from './Sample';
import Segment from './Segment';
import { convertPathToNode } from './_utils';
import { DEFAULT_PRECISION } from './_constants';

// The main function responsible for getting data
// This will take a path, number of samples, number of samples, and a precision value
// It will return an array of Segments, which in turn contains an array of Samples
// This can later be used to generate a stroked path, converted to outlines for a filled path, or flattened for plotting SVG circles
export const getData = ({
  path,
  segments,
  samples,
  precision = DEFAULT_PRECISION
}) => {
  // Convert the given path to a DOM node if it isn't already one
  path = convertPathToNode(path);

  // We decrement the number of samples per segment because when we group them later we will add on the first sample of the following segment
  if (samples > 1) samples--;

  // Get total length of path, total number of samples we will be generating, and two blank arrays to hold samples and segments
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

    // Create a new Sample and push it onto the allSamples array
    allSamples.push(new Sample({ x, y, progress }));
  }

  // Out of all the samples gathered previously, sort them into groups of segments
  // Each group includes the samples of the current segment, with the last sample being first sample from the next segment
  for (let segment = 0; segment < segments; segment++) {
    const currentStart = segment * samples,
      nextStart = currentStart + samples,
      segmentSamples = [];

    // Push all current samples onto segmentSamples
    for (let samInSeg = 0; samInSeg < samples; samInSeg++) {
      segmentSamples.push(allSamples[currentStart + samInSeg]);
    }

    // Push the first sample from the next segment onto segmentSamples
    segmentSamples.push(allSamples[nextStart]);

    // Create a new Segment with the samples from segmentSamples
    allSegments.push(new Segment({ samples: segmentSamples }));
  }

  // Return our group of segments
  return allSegments;
};

// The function responsible for converting strokable data (from getData()) into fillable data
// This allows any SVG path to be filled instead of just stroked, allowing for the user to fill and stroke paths simultaneously
// We start by outlining the stroked data given a specified width and the we average together the edges where adjacent segments touch
export const strokeToFill = (data, width, precision, pathClosed) => {
  const outlinedStrokes = outlineStrokes(data, width, precision),
    averagedSegmentJoins = averageSegmentJoins(
      outlinedStrokes,
      precision,
      pathClosed
    );

  return averagedSegmentJoins;
};

// An internal function for outlining stroked data
const outlineStrokes = (data, width, precision) => {
  // We need to get the points perpendicular to a startPoint, given an angle, radius, and precision
  const getPerpSamples = (angle, radius, precision, startPoint) => {
    const p0 = new Sample({
        ...startPoint,
        x: Math.sin(angle) * radius + startPoint.x,
        y: -Math.cos(angle) * radius + startPoint.y
      }),
      p1 = new Sample({
        ...startPoint,
        x: -Math.sin(angle) * radius + startPoint.x,
        y: Math.cos(angle) * radius + startPoint.y
      });

    // If the user asks to round our x and y values, do so
    if (precision) {
      p0.x = +p0.x.toFixed(precision);
      p0.y = +p0.y.toFixed(precision);
      p1.x = +p1.x.toFixed(precision);
      p1.y = +p1.y.toFixed(precision);
    }

    return [p0, p1];
  };

  // We need to set the radius (half of the width) and have a holding array for outlined Segments
  const radius = width / 2,
    outlinedData = [];

  for (let i = 0; i < data.length; i++) {
    const samples = data[i].samples,
      segmentSamples = [];

    // For each sample point and the following sample point (if there is one) compute the angle
    // Also compute the sample's various perpendicular points (with a distance of radius away from the sample point)
    for (let j = 0; j < samples.length; j++) {
      // If we're at the end of the segment and there are no further points, get outta here!
      if (samples[j + 1] === undefined) break;

      const p0 = samples[j], // First point
        p1 = samples[j + 1], // Second point
        angle = Math.atan2(p1.y - p0.y, p1.x - p0.x), // Perpendicular angle to p0 and p1
        p0Perps = getPerpSamples(angle, radius, precision, p0), // Get perpedicular points with a distance of radius away from p0
        p1Perps = getPerpSamples(angle, radius, precision, p1); // Get perpedicular points with a distance of radius away from p1

      // We only need the p0 perpendenciular points for the first sample
      // The p0 for j > 0 will always be the same as p1 anyhow, so let's not add redundant points
      if (j === 0) {
        segmentSamples.push(...p0Perps);
      }

      // Always push the second sample point's perpendicular points
      segmentSamples.push(...p1Perps);
    }

    // segmentSamples is out of order...
    // Given a segmentSamples length of 8, the points need to be rearranged from: 0, 2, 4, 6, 7, 5, 3, 1
    outlinedData.push(
      new Segment({
        samples: [
          ...segmentSamples.filter((s, i) => i % 2 === 0),
          ...segmentSamples.filter((s, i) => i % 2 === 1).reverse()
        ]
      })
    );
  }

  return outlinedData;
};

// An internal function taking outlinedData (from outlineStrokes()) and averaging adjacent edges
// If we didn't do this, our data would be fillable, but it would look stroked
// This function fixes where segments overlap and underlap each other
const averageSegmentJoins = (outlinedData, precision, pathClosed) => {
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

  const init_outlinedData = JSON.parse(JSON.stringify(outlinedData)); //clone initial outlinedData Object

  for (let i = 0; i < outlinedData.length; i++) {
    // If path is closed: the current segment's samples;
    // If path is open: the current segments' samples, as long as it's not the last segment; Otherwise, the current segments' sample of the initial outlinedData object
    const currentSamples = pathClosed
        ? outlinedData[i].samples
        : outlinedData[i + 1]
        ? outlinedData[i].samples
        : init_outlinedData[i].samples,
      // If path is closed: the next segment's samples, otherwise, the first segment's samples
      // If path is open: the next segment's samples, otherwise, the first segment's samples of the initial outlinedData object
      nextSamples = pathClosed
        ? outlinedData[i + 1]
          ? outlinedData[i + 1].samples
          : outlinedData[0].samples
        : outlinedData[i + 1]
        ? outlinedData[i + 1].samples
        : init_outlinedData[0].samples,
      currentMiddle = currentSamples.length / 2, // The "middle" sample in the current segment's samples
      nextEnd = nextSamples.length - 1; // The last sample in the next segment's samples

    // Average two sets of outlined samples to create p0Average and p1Average
    const p0Average = avg(currentSamples[currentMiddle - 1], nextSamples[0]),
      p1Average = avg(currentSamples[currentMiddle], nextSamples[nextEnd]);

    // If the user asks to round our x and y values, do so
    if (precision) {
      p0Average.x = +p0Average.x.toFixed(precision);
      p0Average.y = +p0Average.y.toFixed(precision);
      p1Average.x = +p1Average.x.toFixed(precision);
      p1Average.y = +p1Average.y.toFixed(precision);
    }

    // Replace the previous values with new Samples
    currentSamples[currentMiddle - 1] = new Sample({
      ...combine(currentSamples, currentMiddle - 1, p0Average)
    });
    currentSamples[currentMiddle] = new Sample({
      ...combine(currentSamples, currentMiddle, p1Average)
    });
    nextSamples[0] = new Sample({
      ...combine(nextSamples, 0, p0Average)
    });
    nextSamples[nextEnd] = new Sample({
      ...combine(nextSamples, nextEnd, p1Average)
    });
  }

  return outlinedData;
};
