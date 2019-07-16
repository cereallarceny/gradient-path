// ----- IMPORTANT NOTE -----
// Please ignore any React code... this library works with any Javascript project and is NOT a React component
// React is used here in Storybook just to get a demo running. :)

import React from 'react';
import { storiesOf } from '@storybook/react';
import {
  withKnobs,
  number,
  boolean,
  text,
  select,
  button
} from '@storybook/addon-knobs';

import * as d3 from 'd3';

import gradientPath, {
  getData,
  outlineStrokes,
  averageSegmentJoins,
  flattenSegments,
  getMiddleSample
} from './';

import CHAINgradientPath from './new-index';

const samplePathData = `M24.3,30
C11.4,30,5,43.3,5,50
s6.4,20,19.3,20
c19.3,0,32.1-40,51.4-40
C88.6,30,95,43.3,95,50
s-6.4,20-19.3,20
C56.4,70,43.6,30,24.3,30z`;

const sampleColors = [
  { color: '#C6FFDD', pos: 0 },
  { color: '#FBD786', pos: 0.25 },
  { color: '#F7797D', pos: 0.5 },
  { color: '#6DD5ED', pos: 0.75 },
  { color: '#C6FFDD', pos: 1 }
];

const saveSvg = (svg, name) => {
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

  const svgData = svg.outerHTML;
  const preface = '<?xml version="1.0" standalone="no"?>\r\n';
  const svgBlob = new Blob([preface, svgData], {
    type: 'image/svg+xml;charset=utf-8'
  });
  const url = URL.createObjectURL(svgBlob);
  const a = document.createElement('a');

  document.body.appendChild(a);
  a.href = url;
  a.download = name;
  a.click();

  setTimeout(() => {
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }, 0);
};

const createDataKnobs = config => {
  const data = text('Path "d"', samplePathData, 'Data');

  const segments = number(
    'Number of segments',
    config && config.segments ? config.segments : 100,
    {
      range: true,
      min: 10,
      max: 600,
      step: 10
    },
    'Data'
  );

  const samples = number(
    'Samples per segment',
    5,
    {
      range: true,
      min: 1,
      max: 40,
      step: 1
    },
    'Data'
  );

  const shouldRound = boolean('Should trim precision?', true, 'Data');
  const precision = shouldRound
    ? number(
        'Decimal precision',
        2,
        {
          range: true,
          min: 1,
          max: 10,
          step: 1
        },
        'Data'
      )
    : null;

  button(
    'Download as SVG',
    () => {
      saveSvg(document.querySelector('#gradient-path'), 'gradient-path.svg');
    },
    'Main'
  );

  return { data, segments, samples, precision };
};

const stories = storiesOf('Gradient Path', module);

stories.addDecorator(withKnobs);

stories.add('AS CHAIN', () => {
  const width = number(
    'Width',
    10,
    {
      range: true,
      min: 1,
      max: 50,
      step: 1
    },
    'Main'
  );

  const { data, segments, samples, precision } = createDataKnobs();

  class RenderComponent extends React.Component {
    componentDidMount() {
      const gp = new CHAINgradientPath(
        document.querySelector('#gradient-path path'),
        [
          {
            type: 'path',
            fill: sampleColors,
            width
          },
          {
            type: 'circle',
            fill: sampleColors,
            width: 2,
            stroke: '#333',
            strokeWidth: 0.5
          }
        ],
        segments,
        samples,
        precision
      );

      gp.render();
    }

    render() {
      return (
        <svg id="gradient-path" width="300" height="200" viewBox="0 0 100 100">
          <path fill="none" d={data}></path>
        </svg>
      );
    }
  }

  return <RenderComponent />;
});

stories.add('with path fill', () => {
  const width = number(
    'Width',
    10,
    {
      range: true,
      min: 1,
      max: 50,
      step: 1
    },
    'Main'
  );

  const { data, segments, samples, precision } = createDataKnobs();

  class RenderComponent extends React.Component {
    componentDidMount() {
      gradientPath({
        path: document.querySelector('#gradient-path path'),
        elements: [
          {
            type: 'path',
            fill: sampleColors,
            width
          }
        ],
        data: {
          segments,
          samples,
          precision
        }
      });
    }

    render() {
      return (
        <svg id="gradient-path" width="300" height="200" viewBox="0 0 100 100">
          <path fill="none" d={data}></path>
        </svg>
      );
    }
  }

  return <RenderComponent />;
});

stories.add('with path stroke', () => {
  const width = number(
    'Width',
    10,
    {
      range: true,
      min: 1,
      max: 50,
      step: 1
    },
    'Main'
  );

  const { data, segments, samples, precision } = createDataKnobs();

  class RenderComponent extends React.Component {
    componentDidMount() {
      gradientPath({
        path: document.querySelector('#gradient-path path'),
        elements: [
          {
            type: 'path',
            stroke: sampleColors,
            strokeWidth: width
          }
        ],
        data: {
          segments,
          samples,
          precision
        }
      });
    }

    render() {
      return (
        <svg id="gradient-path" width="300" height="200" viewBox="0 0 100 100">
          <path fill="none" d={data}></path>
        </svg>
      );
    }
  }

  return <RenderComponent />;
});

stories.add('with circles (fill & stroke)', () => {
  const width = number(
    'Width',
    5,
    {
      range: true,
      min: 1,
      max: 50,
      step: 1
    },
    'Main'
  );

  const strokeColor = text('Stroke color', '#eee', 'Main');

  const strokeWidth = number(
    'Stroke width',
    1,
    {
      range: true,
      min: 0,
      max: 10,
      step: 1
    },
    'Main'
  );

  const { data, segments, samples, precision } = createDataKnobs({
    segments: 10
  });

  class RenderComponent extends React.Component {
    componentDidMount() {
      gradientPath({
        path: document.querySelector('#gradient-path path'),
        elements: [
          {
            type: 'circle',
            fill: sampleColors,
            width,
            stroke: strokeColor,
            strokeWidth
          }
        ],
        data: {
          segments,
          samples,
          precision
        }
      });
    }

    render() {
      return (
        <svg id="gradient-path" width="300" height="200" viewBox="0 0 100 100">
          <path fill="none" d={data}></path>
        </svg>
      );
    }
  }

  return <RenderComponent />;
});

stories.add('with multiple elements', () => {
  const width = number(
    'Width',
    10,
    {
      range: true,
      min: 1,
      max: 50,
      step: 1
    },
    'Main'
  );

  const circleFill = text('Circle fill', '#eee', 'Main');

  const circleWidth = number(
    'Circle width',
    3,
    {
      range: true,
      min: 0,
      max: 10,
      step: 1
    },
    'Main'
  );

  const { data, segments, samples, precision } = createDataKnobs({
    segments: 10
  });

  class RenderComponent extends React.Component {
    componentDidMount() {
      gradientPath({
        path: document.querySelector('#gradient-path path'),
        elements: [
          {
            type: 'path',
            fill: sampleColors,
            width
          },
          {
            type: 'circle',
            fill: circleFill,
            width: circleWidth,
            stroke: '#333',
            strokeWidth: 0.5
          }
        ],
        data: {
          segments,
          samples,
          precision
        }
      });
    }

    render() {
      return (
        <svg id="gradient-path" width="300" height="200" viewBox="0 0 100 100">
          <path fill="none" d={data}></path>
        </svg>
      );
    }
  }

  return <RenderComponent />;
});

stories.add('using d3.js', () => {
  const width = number(
    'Width',
    10,
    {
      range: true,
      min: 1,
      max: 50,
      step: 1
    },
    'Main'
  );

  const element = select('Element', ['path', 'circle'], 'path', 'Main');

  const { data, segments, samples, precision } = createDataKnobs();

  class RenderComponent extends React.Component {
    componentDidMount() {
      const colors = d3.interpolateRainbow;
      const path = d3.select('path').remove();

      const data = getData(path, segments, samples, precision),
        outlinedStrokes = outlineStrokes(data, width, precision),
        finalData = averageSegmentJoins(outlinedStrokes, precision);

      const flattenedData = flattenSegments(data);

      if (element === 'path') {
        const lineFunc = d3
          .line()
          .x(d => d.x)
          .y(d => d.y);

        d3.select('svg')
          .selectAll('path')
          .data(finalData)
          .enter()
          .append('path')
          .attr('fill', d => colors(getMiddleSample(d).progress))
          .attr('d', lineFunc);
      } else if (element === 'circle') {
        d3.select('svg')
          .selectAll('circle')
          .data(flattenedData)
          .enter()
          .append('circle')
          .attr('cx', d => d.x)
          .attr('cy', d => d.y)
          .style('fill', d => colors(d.progress))
          .attr('r', width / 2);
      }
    }

    render() {
      return (
        <svg id="gradient-path" width="300" height="200" viewBox="0 0 100 100">
          <path fill="none" d={data}></path>
        </svg>
      );
    }
  }

  return <RenderComponent />;
});
