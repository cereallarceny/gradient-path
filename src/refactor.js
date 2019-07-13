import * as d3 from 'd3';

export const getNewSamples = (path, numSegments, numSamplesPerSegment) => {
  const pathLength = path.getTotalLength(),
    totalSamples = numSegments * numSamplesPerSegment,
    allSamples = [],
    allSegments = [];

  for (let sample = 0; sample <= totalSamples; sample++) {
    const progress = sample / totalSamples;
    const { x, y } = path.getPointAtLength(progress * pathLength);

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

// const getSamples = (path, precision) => {
//   const pathLength = path.getTotalLength(),
//     samples = [];

//   samples.push(0);

//   let i = 0;
//   while ((i += precision) < pathLength) samples.push(i);

//   samples.push(pathLength);

//   return samples.map(t => {
//     const { x, y } = path.getPointAtLength(t),
//       a = [x, y];

//     a.color = t / pathLength;

//     return a;
//   });
// };

// export const splitPath = (p, sampleInterval) => {
//   const pLength = p.getTotalLength(),
//     numPieces = 10,
//     pieceSizes = [],
//     pieces = [];

//   let cumu = 0;

//   for (let i = 0; i < numPieces; i++) {
//     pieceSizes.push({ i, size: Math.floor(Math.random() * 20) + 5 });
//   }

//   const size = pieceSizes.reduce((a, b) => {
//       return a + b.size;
//     }, 0),
//     pieceSize = pLength / size;

//   pieceSizes.forEach((x, j) => {
//     const segs = [];

//     for (let i = 0; i <= x.size + sampleInterval; i += sampleInterval) {
//       const pt = p.getPointAtLength(i * pieceSize + cumu * pieceSize);

//       segs.push([pt.x, pt.y]);
//     }

//     const angle =
//       (Math.atan2(segs[1][1] - segs[0][1], segs[1][0] - segs[0][0]) * 180) /
//       Math.PI;

//     // TODO: Angle doesn't do anything...
//     pieces.push({ id: j, segs, angle });

//     cumu += x.size;
//   });

//   return pieces;
// };

export const drawSegments = (pieces, g, colors) => {
  const lineFunc = d3
    .line()
    .x(d => d.x)
    .y(d => d.y);

  g.selectAll('path.piece')
    .data(pieces)
    .enter()
    .append('path')
    .attr('fill', 'none')
    .attr('stroke-width', 12)
    .attr('class', 'piece')
    .attr('d', lineFunc)
    .attr('stroke', (d, i) => colors[i]);
};

export const drawPoints = (pieces, g, colors) => {
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
    .style('fill', d => colors[d.id])
    .attr('r', 0)
    .transition()
    .duration(0)
    .delay((d, i) => i * 10)
    .attr('r', 2);
};
