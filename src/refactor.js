export const getData = (
  path,
  numSegments,
  numSamplesPerSegment,
  decimalPlaces
) => {
  path = path.node();

  const pathLength = path.getTotalLength(),
    totalSamples = numSegments * numSamplesPerSegment,
    allSamples = [],
    allSegments = [];

  for (let sample = 0; sample <= totalSamples; sample++) {
    const progress = sample / totalSamples;
    let { x, y } = path.getPointAtLength(progress * pathLength);

    if (decimalPlaces) {
      x = x.toFixed(decimalPlaces);
      y = y.toFixed(decimalPlaces);
    }

    allSamples.push({
      x,
      y,
      progress
    });
  }

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

export const flatten = pieces =>
  pieces
    .map((segment, i) => {
      return segment.map(sample => {
        return { ...sample, id: i };
      });
    })
    .flat();

export default () => {};
