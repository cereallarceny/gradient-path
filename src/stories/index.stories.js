// ----- IMPORTANT NOTE -----
// Please ignore any React code... this library works with any Javascript project and is NOT a React component
// React is used here in Storybook just to get a demo running. :)

import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, number, text } from '@storybook/addon-knobs';

import { createDataKnobs, Container, markdownStyling } from './helpers';

import { GradientPath } from '..';

const sampleColors = [
  { color: '#C6FFDD', pos: 0 },
  { color: '#FBD786', pos: 0.25 },
  { color: '#F7797D', pos: 0.5 },
  { color: '#6DD5ED', pos: 0.75 },
  { color: '#C6FFDD', pos: 1 }
];

const stories = storiesOf('Gradient Path/Javascript', module);

stories.addDecorator(withKnobs);

stories.add(
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
        const gp = new GradientPath({
          path: document.querySelector('#gradient-path path'),
          segments,
          samples,
          precision
        });

        gp.render({
          type: 'path',
          fill: sampleColors,
          width
        });
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
import GradientPath from 'gradient-path';

const gp = new GradientPath({
  path: document.querySelector('#gradient-path path'),
  segments: 30,
  samples: 3,
  precision: 2
});

gp.render({
  type: 'path',
  fill: [
    { color: '#C6FFDD', pos: 0 },
    { color: '#FBD786', pos: 0.25 },
    { color: '#F7797D', pos: 0.5 },
    { color: '#6DD5ED', pos: 0.75 },
    { color: '#C6FFDD', pos: 1 }
  ],
  width: 10
});
`)
);

stories.add(
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
        const gp = new GradientPath({
          path: document.querySelector('#gradient-path path'),
          segments,
          samples,
          precision
        });

        gp.render({
          type: 'path',
          stroke: sampleColors,
          strokeWidth: width
        });
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
import GradientPath from 'gradient-path';

const gp = new GradientPath({
  path: document.querySelector('#gradient-path path'),
  segments: 30,
  samples: 3,
  precision: 2
});

gp.render({
  type: 'path',
  stroke: [
    { color: '#C6FFDD', pos: 0 },
    { color: '#FBD786', pos: 0.25 },
    { color: '#F7797D', pos: 0.5 },
    { color: '#6DD5ED', pos: 0.75 },
    { color: '#C6FFDD', pos: 1 }
  ],
  strokeWidth: 10
});
`)
);

stories.add(
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
        const gp = new GradientPath({
          path: document.querySelector('#gradient-path path'),
          segments,
          samples,
          precision
        });

        gp.render({
          type: 'circle',
          fill: sampleColors,
          width,
          stroke: strokeColor,
          strokeWidth
        });
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
import GradientPath from 'gradient-path';

const gp = new GradientPath({
  path: document.querySelector('#gradient-path path'),
  segments: 30,
  samples: 3,
  precision: 2
});

gp.render({
  type: 'circle',
  fill: [
    { color: '#C6FFDD', pos: 0 },
    { color: '#FBD786', pos: 0.25 },
    { color: '#F7797D', pos: 0.5 },
    { color: '#6DD5ED', pos: 0.75 },
    { color: '#C6FFDD', pos: 1 }
  ],
  width: 10,
  stroke: '#444',
  strokeWidth: 1
});
`)
);

stories.add(
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
        const gp = new GradientPath({
          path: document.querySelector('#gradient-path path'),
          segments,
          samples,
          precision
        });

        gp.render({
          type: 'path',
          fill: sampleColors,
          width
        });

        gp.render({
          type: 'circle',
          fill: circleFill,
          width: circleWidth,
          stroke: '#444',
          strokeWidth: 0.5
        });
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
import GradientPath from 'gradient-path';

const gp = new GradientPath({
  path: document.querySelector('#gradient-path path'),
  segments: 30,
  samples: 3,
  precision: 2
});

gp.render({
  type: 'path',
  fill: [
    { color: '#C6FFDD', pos: 0 },
    { color: '#FBD786', pos: 0.25 },
    { color: '#F7797D', pos: 0.5 },
    { color: '#6DD5ED', pos: 0.75 },
    { color: '#C6FFDD', pos: 1 }
  ],
  width: 10
});

gp.render({
  type: 'circle',
  fill: '#eee',
  width: 3,
  stroke: '#444',
  strokeWidth: 0.5
});
`)
);
