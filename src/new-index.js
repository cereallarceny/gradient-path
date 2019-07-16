import { svgElem, styleAttrs, segmentToD } from './_utils';

export default class {
  constructor(path, elements, numSegments, numSamples, precision = 2) {
    // If the path being passed isn't a DOM node already, make it one
    path =
      path instanceof Element || path instanceof HTMLDocument
        ? path
        : path.node();

    this.path = path;
    this.elements = elements;
    this.numSegments = numSegments;
    this.numSamples = numSamples;
    this.precision = precision;

    this.data = [];
  }

  getData() {
    let { path, numSegments, numSamples, precision } = this;

    // We decrement the number of samples per segment because when we group them later we will add on the first sample of the following segment
    if (numSamples > 1) numSamples--;

    // Get total length of path, total number of samples, and two blank arrays to hold samples and segments
    const pathLength = path.getTotalLength(),
      totalSamples = numSegments * numSamples,
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

    // Out of all the samples gathered, sort them into groups of length = numSamples
    // Each group includes the samples of the current segment, with the last sample being first sample from the next group
    // This "nextStart" becomes the "currentStart" every time segment is interated
    for (let segment = 0; segment < numSegments; segment++) {
      const currentStart = segment * numSamples;
      const nextStart = currentStart + numSamples;
      const segments = [];

      for (let samInSeg = 0; samInSeg < numSamples; samInSeg++) {
        segments.push(allSamples[currentStart + samInSeg]);
      }

      segments.push(allSamples[nextStart]);

      allSegments.push(segments);
    }

    this.data = allSegments;

    return this;
  }

  // TODO: We should definitely refactor this...
  flattenSegments() {
    this.data = this.data
      .map((segment, i) => {
        return segment.map(sample => {
          return { ...sample, id: i };
        });
      })
      .flat();

    return this;
  }

  getMiddleSample(segment) {
    const sortedSegment = [...segment].sort((a, b) => a.progress - b.progress);

    return sortedSegment[(sortedSegment.length / 2) | 0];
  }

  outlineStrokes(width) {
    const { data, precision } = this;

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

    this.data = outlinedData;

    return this;
  }

  averageSegmentJoins() {
    const { data, precision } = this;

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

    this.data = data;

    return this;
  }

  render() {
    const { path, elements, segments, samples, precision } = this;
    const svg = path.closest('svg');

    this.getData(path, segments, samples, precision);

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
        // If we specify a width, we will be filling, so we need to outline the path and then average the join points of the segments
        if (width) {
          this.outlineStrokes(width).averageSegmentJoins();
        }

        this.data.forEach(segment => {
          // Create a path for each segment (array of samples) and append it to its elemGroup
          elemGroup.appendChild(
            svgElem('path', {
              class: 'path-segment',
              d: segmentToD(segment),
              ...styleAttrs(
                fill,
                stroke,
                strokeWidth,
                this.getMiddleSample(segment).progress
              )
            })
          );
        });
      } else if (type === 'circle') {
        this.flattenSegments();

        this.data.forEach(sample => {
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
        });
      }
    });

    return this;
  }
}
