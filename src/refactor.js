import * as d3 from 'd3';

export const getNewSamples = (
  path,
  numSegments,
  numSamplesPerSegment,
  accuracy
) => {
  const pathLength = path.getTotalLength(),
    totalSamples = numSegments * numSamplesPerSegment,
    allSamples = [],
    allSegments = [];

  for (let sample = 0; sample <= totalSamples; sample++) {
    const progress = sample / totalSamples;
    let { x, y } = path.getPointAtLength(progress * pathLength);

    if (accuracy) {
      x = x.toFixed(accuracy);
      y = y.toFixed(accuracy);
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

export const drawSegments = (pieces, g, colors, size) => {
  const lineFunc = d3
    .line()
    .x(d => d.x)
    .y(d => d.y);

  g.selectAll('path.piece')
    .data(pieces)
    .enter()
    .append('path')
    .attr('fill', 'none')
    .attr('stroke-width', size)
    .attr('class', 'piece')
    .attr('d', lineFunc)
    .attr('stroke', d => colors(d[(d.length / 2) | 0].progress));
};

export const drawPoints = (pieces, g, colors, size) => {
  g.selectAll('circle')
    .data(
      pieces
        .map((segment, i) => {
          return segment.map(sample => {
            return { ...sample, id: i };
          });
        })
        .flat()
    )
    .enter()
    .append('circle')
    .attr('cx', d => d.x)
    .attr('cy', d => d.y)
    .style('fill', d => colors(d.progress))
    .attr('r', 0)
    .transition()
    .duration(0)
    .delay((d, i) => i * 10)
    .attr('r', size / 2);
};
