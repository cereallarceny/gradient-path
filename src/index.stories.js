import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, number, boolean, text } from '@storybook/addon-knobs';

import * as d3 from 'd3';

import gradientPath, { getData, getPathPoints, getPathData } from './index';

const samplePathData = `M24.3,30
C11.4,30,5,43.3,5,50
s6.4,20,19.3,20
c19.3,0,32.1-40,51.4-40
C88.6,30,95,43.3,95,50
s-6.4,20-19.3,20
C56.4,70,43.6,30,24.3,30z`;

const stories = storiesOf('GradientPath', module);

stories.addDecorator(withKnobs);

stories.add('default', () => {
  const debug = boolean('Debug', false);

  const data = text('Path "d"', samplePathData);

  const precision = number('Precision', 1, {
    range: true,
    min: 1,
    max: 50,
    step: 1
  });

  const width = number('Width', 10, {
    range: true,
    min: 1,
    max: 50,
    step: 1
  });

  const hasStroke = boolean('Has stroke?', true);

  const stroke = hasStroke
    ? number('Stroke', 1, {
        range: true,
        min: 1,
        max: 50,
        step: 1
      })
    : null;

  const repeat = boolean('Should repeat?', true);

  class RenderComponent extends React.Component {
    componentDidMount() {
      // Please ignore any React stuff... this works with any Javascript project and is NOT a React component
      // React is used here in Storybook just to get a demo running. :)
      gradientPath({
        path: document.querySelector('#infinity path'),
        stops: [
          { color: '#E9A36C', pos: 0 },
          { color: '#965167', pos: 0.25 },
          { color: '#231F3C', pos: 0.5 },
          { color: '#965167', pos: 0.75 },
          { color: '#E9A36C', pos: 1 }
        ],
        width,
        precision,
        stroke: hasStroke ? stroke : null,
        repeat,
        debug
      });
    }

    render() {
      return (
        <svg id="infinity" width="300" height="200" viewBox="0 0 100 100">
          <path fill="none" d={data}></path>
        </svg>
      );
    }
  }

  return <RenderComponent />;
});

stories.add('using D3.js', () => {
  const debug = boolean('Debug', false);

  const data = text('Path "d"', samplePathData);

  const precision = number('Precision', 1, {
    range: true,
    min: 1,
    max: 50,
    step: 1
  });

  const width = number('Width', 10, {
    range: true,
    min: 1,
    max: 50,
    step: 1
  });

  // TODO: We have to implement this somehow...
  const repeat = boolean('Should repeat?', true);

  class RenderComponent extends React.Component {
    componentDidMount() {
      // Please ignore any React stuff... this works with any Javascript project and is NOT a React component
      // React is used here in Storybook just to get a demo running. :)
      const color = d3.interpolateRainbow;
      const path = d3.select('path').remove();

      const data = getData(path.node(), precision);

      d3.select('svg')
        .selectAll('path')
        .data(data)
        .enter()
        .append('path')
        .style('fill', d => color(d.color))
        .attr('d', d => getPathData(getPathPoints(d, width)));

      // If you want to draw dots for debugging purposes...
      if (debug) {
        data.forEach(vertex => {
          // BUG: For some reason we're getting "undefined" for some of these
          vertex = vertex.filter(x => x);

          d3.select('svg')
            .selectAll('.segment-dot')
            .data(vertex)
            .enter()
            .append('circle')
            .attr('cx', d => d[0])
            .attr('cy', d => d[1])
            .attr('fill', '#000')
            .attr('r', 1);

          // Pass true to get the raw points, otherwise you get a SVG path string
          getPathPoints(vertex, width).forEach(point => {
            d3.select('svg')
              .selectAll('.quad-dot')
              .data([point])
              .enter()
              .append('circle')
              .attr('cx', d => d[0])
              .attr('cy', d => d[1])
              .attr('fill', '#f00')
              .attr('r', 1);
          });
        });
      }
    }

    render() {
      return (
        <svg id="infinity" width="300" height="200" viewBox="0 0 100 100">
          <path fill="none" d={data}></path>
        </svg>
      );
    }
  }

  return <RenderComponent />;
});
