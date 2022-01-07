import React from 'react';
import { number, boolean, text, button } from '@storybook/addon-knobs';

export const markdownStyling = code => ({
  notes: {
    markdown: `
      # Gradient Path

      [Link to documentation](https://github.com/cereallarceny/gradient-path)

      Simply add **gradient-path** to your project [from NPM](https://www.npmjs.com/package/gradient-path) and use it like such:

      ~~~js
      ${code}
      ~~~
    `
  }
});

const noteStyles = {
  fontFamily: 'sans-serif',
  fontWeight: 'bold',
  color: '#ccc',
  marginBottom: 0
};

export const Container = ({ children }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}
  >
    {children}
    <p style={noteStyles}>Check the "Notes" panel for source code</p>
    <p style={noteStyles}>Change the "Knobs" to control the SVG</p>
  </div>
);

const samplePathData = `M24.3,30
C11.4,30,5,43.3,5,50
s6.4,20,19.3,20
c19.3,0,32.1-40,51.4-40
C88.6,30,95,43.3,95,50
s-6.4,20-19.3,20
C56.4,70,43.6,30,24.3,30z`;

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

export const createDataKnobs = config => {
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
