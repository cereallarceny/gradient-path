import * as d3 from 'd3';

export const splitPath = (p, sampleInterval) => {
  const pLength = p.getTotalLength(),
    numPieces = 10,
    pieceSizes = [],
    pieces = [];

  let cumu = 0;

  for (let i = 0; i < numPieces; i++) {
    pieceSizes.push({ i, size: Math.floor(Math.random() * 20) + 5 });
  }

  const size = pieceSizes.reduce((a, b) => {
      return a + b.size;
    }, 0),
    pieceSize = pLength / size;

  pieceSizes.forEach((x, j) => {
    const segs = [];

    for (let i = 0; i <= x.size + sampleInterval; i += sampleInterval) {
      const pt = p.getPointAtLength(i * pieceSize + cumu * pieceSize);

      segs.push([pt.x, pt.y]);
    }

    const angle =
      (Math.atan2(segs[1][1] - segs[0][1], segs[1][0] - segs[0][0]) * 180) /
      Math.PI;

    // TODO: Angle doesn't do anything...
    pieces.push({ id: j, segs, angle });

    cumu += x.size;
  });

  return pieces;
};

export const drawSegments = (pieces, g, colors) => {
  const lineFunc = d3
    .line()
    .x(d => d[0])
    .y(d => d[1]);

  g.selectAll('path.piece')
    .data(pieces)
    .enter()
    .append('path')
    .attr('fill', 'none')
    .attr('stroke-width', 12)
    .attr('class', 'piece')
    .attr('d', d => lineFunc(d.segs))
    .attr('stroke', (d, i) => colors[i]);
};

export const drawPoints = (pieces, g, colors) => {
  const points = [];

  pieces.forEach(x => {
    x.segs.forEach((seg, i) => {
      if (i > 0 && i % 2 === 0) {
        points.push({ id: x.id, seg });
      }
    });
  });

  g.selectAll('circle')
    .data(points)
    .enter()
    .append('circle')
    .attr('cx', d => d.seg[0])
    .attr('cy', d => d.seg[1])
    .style('fill', d => colors[d.id])
    .attr('r', 0)
    .transition()
    .duration(0)
    .delay((d, i) => i * 10)
    .attr('r', 2);
};
