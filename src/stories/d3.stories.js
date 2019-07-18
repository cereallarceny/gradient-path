// ----- IMPORTANT NOTE -----
// Please ignore any React code... this library works with any Javascript project and is NOT a React component
// React is used here in Storybook just to get a demo running. :)

import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, number, text } from '@storybook/addon-knobs';

import * as d3 from 'd3';

import { createDataKnobs, Container, markdownStyling } from './helpers';

import { getData, strokeToFill } from '..';

const d3Stories = storiesOf('Gradient Path/Using D3', module);

d3Stories.addDecorator(withKnobs);

d3Stories.add(
  'with path fill',
  () => {
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
        const colors = d3.interpolateRainbow;
        const path = d3.select('path').remove();
        const data = getData({ path, segments, samples, precision });

        const lineFunc = d3
          .line()
          .x(d => d.x)
          .y(d => d.y);

        d3.select('svg')
          .selectAll('path')
          .data(strokeToFill(data, width, precision))
          .enter()
          .append('path')
          .attr('fill', d => colors(d.progress))
          .attr('d', d => lineFunc(d.samples));
      }

      render() {
        return (
          <svg
            id="gradient-path"
            width="300"
            height="200"
            viewBox="0 0 100 100"
          >
            <path fill="none" d={data}></path>
          </svg>
        );
      }
    }

    return (
      <Container>
        <RenderComponent />
      </Container>
    );
  },
  markdownStyling(`
import * as d3 from 'd3';
import { getData, strokeToFill } from 'gradient-path';

const segments = 30,
  samples = 3,
  precision = 2,
  width = 10;

const colors = d3.interpolateRainbow;
const path = d3.select('path').remove();
const data = getData({ path, segments, samples, precision });

const lineFunc = d3
  .line()
  .x(d => d.x)
  .y(d => d.y);

d3.select('svg')
  .selectAll('path')
  .data(strokeToFill(data, width, precision))
  .enter()
  .append('path')
  .attr('fill', d => colors(d.progress))
  .attr('d', d => lineFunc(d.samples));
`)
);

d3Stories.add(
  'with path stroke',
  () => {
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
        const colors = d3.interpolateRainbow;
        const path = d3.select('path').remove();
        const data = getData({ path, segments, samples, precision });

        const lineFunc = d3
          .line()
          .x(d => d.x)
          .y(d => d.y);

        d3.select('svg')
          .selectAll('path')
          .data(data)
          .enter()
          .append('path')
          .attr('stroke', d => colors(d.progress))
          .attr('stroke-width', width)
          .attr('d', d => lineFunc(d.samples));
      }

      render() {
        return (
          <svg
            id="gradient-path"
            width="300"
            height="200"
            viewBox="0 0 100 100"
          >
            <path fill="none" d={data}></path>
          </svg>
        );
      }
    }

    return (
      <Container>
        <RenderComponent />
      </Container>
    );
  },
  markdownStyling(`
import * as d3 from 'd3';
import { getData } from 'gradient-path';

const segments = 30,
  samples = 3,
  precision = 2,
  width = 10;

const colors = d3.interpolateRainbow;
const path = d3.select('path').remove();
const data = getData({ path, segments, samples, precision });

const lineFunc = d3
  .line()
  .x(d => d.x)
  .y(d => d.y);

d3.select('svg')
  .selectAll('path')
  .data(data)
  .enter()
  .append('path')
  .attr('stroke', d => colors(d.progress))
  .attr('stroke-width', width)
  .attr('d', d => lineFunc(d.samples));
`)
);

d3Stories.add(
  'with circles (fill & stroke)',
  () => {
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

    const strokeColor = text('Stroke color', '#444', 'Main');

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
        const colors = d3.interpolateRainbow;
        const path = d3.select('path').remove();
        const data = getData({ path, segments, samples, precision });
        const flattenedData = data.flatMap(({ samples }) => samples);

        d3.select('svg')
          .selectAll('circle')
          .data(flattenedData)
          .enter()
          .append('circle')
          .attr('cx', d => d.x)
          .attr('cy', d => d.y)
          .attr('r', width / 2)
          .attr('fill', d => colors(d.progress))
          .attr('stroke', strokeColor)
          .attr('stroke-width', strokeWidth);
      }

      render() {
        return (
          <svg
            id="gradient-path"
            width="300"
            height="200"
            viewBox="0 0 100 100"
          >
            <path fill="none" d={data}></path>
          </svg>
        );
      }
    }

    return (
      <Container>
        <RenderComponent />
      </Container>
    );
  },
  markdownStyling(`
import * as d3 from 'd3';
import { getData } from 'gradient-path';

const segments = 30,
  samples = 3,
  precision = 2,
  width = 10;

const colors = d3.interpolateRainbow;
const path = d3.select('path').remove();
const data = getData({ path, segments, samples, precision });
const flattenedData = data.flatMap(({ samples }) => samples);

d3.select('svg')
  .selectAll('circle')
  .data(flattenedData)
  .enter()
  .append('circle')
  .attr('cx', d => d.x)
  .attr('cy', d => d.y)
  .attr('r', width / 2)
  .attr('fill', d => colors(d.progress))
  .attr('stroke', '#444')
  .attr('stroke-width', 1);
`)
);

d3Stories.add(
  'with multiple elements',
  () => {
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
        const colors = d3.interpolateRainbow;
        const path = d3.select('path').remove();
        const data = getData({ path, segments, samples, precision });
        const flattenedData = data.flatMap(({ samples }) => samples);

        const lineFunc = d3
          .line()
          .x(d => d.x)
          .y(d => d.y);

        d3.select('svg')
          .selectAll('path')
          .data(strokeToFill(data, width, precision))
          .enter()
          .append('path')
          .attr('fill', d => colors(d.progress))
          .attr('d', d => lineFunc(d.samples));

        d3.select('svg')
          .selectAll('circle')
          .data(flattenedData)
          .enter()
          .append('circle')
          .attr('cx', d => d.x)
          .attr('cy', d => d.y)
          .attr('r', circleWidth / 2)
          .attr('fill', circleFill)
          .attr('stroke', '#444')
          .attr('stroke-width', 0.5);
      }

      render() {
        return (
          <svg
            id="gradient-path"
            width="300"
            height="200"
            viewBox="0 0 100 100"
          >
            <path fill="none" d={data}></path>
          </svg>
        );
      }
    }

    return (
      <Container>
        <RenderComponent />
      </Container>
    );
  },
  markdownStyling(`
import * as d3 from 'd3';
import { getData, strokeToFill } from 'gradient-path';

const segments = 30,
  samples = 3,
  precision = 2,
  width = 10;

const colors = d3.interpolateRainbow;
const path = d3.select('path').remove();
const data = getData({ path, segments, samples, precision });
const flattenedData = data.flatMap(({ samples }) => samples);

const lineFunc = d3
  .line()
  .x(d => d.x)
  .y(d => d.y);

d3.select('svg')
  .selectAll('path')
  .data(strokeToFill(data, width, precision))
  .enter()
  .append('path')
  .attr('fill', d => colors(d.progress))
  .attr('d', d => lineFunc(d.samples));

d3.select('svg')
  .selectAll('circle')
  .data(flattenedData)
  .enter()
  .append('circle')
  .attr('cx', d => d.x)
  .attr('cy', d => d.y)
  .attr('r', 1.5)
  .attr('fill', '#eee')
  .attr('stroke', '#444')
  .attr('stroke-width', 0.5);
`)
);
